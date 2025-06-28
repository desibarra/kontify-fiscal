// This service acts as a true API client, making HTTP requests to a backend.
import type { Asesor, Lead, AuditLog, AIAnalysis } from '../types';

const API_BASE_URL = '/api'; // Adjust if your backend is on a different domain/port

const getAuthToken = (): string | null => {
    return localStorage.getItem('kontify_token');
};

const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
    };
};

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
             // Handle unauthorized access, e.g., redirect to login
             console.error('Authentication error. Redirecting to login.');
             localStorage.removeItem('kontify_user');
             localStorage.removeItem('kontify_token');
             window.location.href = '/'; // Or trigger a state change in App
        }
        const error = await response.json();
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};


// --- Authentication ---
export const apiLogin = async (email: string, password: string): Promise<{user: Asesor, token: string} | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await handleResponse(response);
        if (data.success && data.user && data.token) {
            return { user: data.user, token: data.token };
        }
        return null;
    } catch (error) {
        console.error('Login API error:', error);
        return null;
    }
};

// --- Leads / Consultas ---
export const apiGetLeads = async (): Promise<Lead[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/consultas/read.php`, {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        return data.leads || [];
    } catch (error) {
        console.error('Get Leads API error:', error);
        return [];
    }
};

export const apiCreateLead = async (leadData: { name: string, email: string, query_details: string }): Promise<Lead | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/consultas/create.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({source: 'chatbot', ...leadData}),
        });
        const data = await handleResponse(response);
        return data.lead || null;
    } catch (error) {
        console.error('Create Lead API error:', error);
        return null;
    }
};

export const apiUpdateLead = async (updatedLead: Lead): Promise<Lead | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/consultas/update.php`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedLead),
    });
    const data = await handleResponse(response);
    return data.lead || null;
  } catch (error) {
      console.error('Update Lead API error:', error);
      return null;
  }
};


// --- Asesores Management (Admin Only) ---
export const apiGetAsesores = async (): Promise<Asesor[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/asesores/read.php`, {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        return data.asesores || [];
    } catch (error) {
        console.error('Get Asesores API error:', error);
        return [];
    }
};

export const apiUpdateAsesorStatus = async (asesorId: number, status: 'active' | 'inactive'): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/asesores/update_status.php`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ id: asesorId, status }),
        });
        const data = await handleResponse(response);
        return data.success || false;
    } catch (error) {
        console.error('Update Asesor Status API error:', error);
        return false;
    }
};

// --- Reports & Dashboard ---
export const apiGetDashboardStats = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/reportes/dashboard.php`, {
            headers: getAuthHeaders(),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Get Dashboard Stats API error:', error);
        return { totalLeads: 0, pendingLeads: 0, assignedLeads: 0, completedLeads: 0, activeExperts: 0 };
    }
}

// --- Audit Log (Admin Only) ---
export const apiGetAuditLogs = async (): Promise<AuditLog[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/bitacora/read.php`, {
            headers: getAuthHeaders(),
        });
        const data = await handleResponse(response);
        return data.logs || [];
    } catch(error) {
        console.error('Get Audit Logs API error:', error);
        return [];
    }
};

// --- Chatbot (Public) ---
export const apiGetOpenAIChatResponse = async (history: { role: 'user' | 'assistant', content: string }[]): Promise<string | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/chat/openai.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ history }),
        });
        const data = await handleResponse(response);
        // Backend should return a structure like { success: true, reply: "..." }
        return data.reply || null;
    } catch (error) {
        console.error('OpenAI Chat API error:', error);
        return "Lo siento, estoy teniendo problemas para conectarme. Por favor intenta más tarde.";
    }
}

// --- AI Analysis (Admin) ---
export const apiAnalyzeLeadQuery = async (query: string): Promise<{analysis: AIAnalysis} | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/analysis/gemini.php`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ query }),
        });
        // Backend should return a structure like { success: true, analysis: AIAnalysis }
        return await handleResponse(response);
    } catch (error) {
        console.error('Gemini Analysis API error:', error);
        return null;
    }
};