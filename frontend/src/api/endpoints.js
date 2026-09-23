import api from './client';

export const authApi = {
  studentSignup: (data) => api.post('/auth/student/signup', data),
  companySignup: (data) => api.post('/auth/company/signup', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const studentApi = {
  getProfile: () => api.get('/student/profile'),
  updateProfile: (data) => api.put('/student/profile', data),
  uploadResume: (formData) =>
    api.post('/student/resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  browseDrives: (params) => api.get('/student/drives', { params }),
  getDrive: (id) => api.get(`/student/drives/${id}`),
  apply: (id) => api.post(`/student/drives/${id}/apply`),
  toggleSave: (id) => api.post(`/student/drives/${id}/save`),
  savedDrives: () => api.get('/student/saved-drives'),
  applications: (params) => api.get('/student/applications', { params }),
  simulator: () => api.get('/student/eligibility-simulator'),
};

export const companyApi = {
  getProfile: () => api.get('/company/profile'),
  updateProfile: (data) => api.put('/company/profile', data),
  createDrive: (data) => api.post('/company/drives', data),
  listDrives: () => api.get('/company/drives'),
  updateDrive: (id, data) => api.put(`/company/drives/${id}`, data),
  deleteDrive: (id) => api.delete(`/company/drives/${id}`),
  applicants: (id, params) => api.get(`/company/drives/${id}/applicants`, { params }),
  updateApplicationStatus: (id, data) => api.put(`/company/applications/${id}/status`, data),
};

export const tpoApi = {
  students: (params) => api.get('/tpo/students', { params }),
  companies: () => api.get('/tpo/companies'),
  drives: () => api.get('/tpo/drives'),
  applications: (params) => api.get('/tpo/applications', { params }),
  setUserActive: (id, isActive) => api.put(`/tpo/users/${id}/status`, { isActive }),
  bulkImportStudents: (rows) => api.post('/tpo/students/bulk-import', { rows }),
  analytics: () => api.get('/tpo/analytics'),
  exportApplicationsCsvUrl: () => `${api.defaults.baseURL}/tpo/export/applications`,
};

export const notificationApi = {
  list: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export const aiApi = {
  // Recruiter Copilot
  getRankedCandidates: (driveId, params) => api.get(`/ai/recruiter/drives/${driveId}/ranked-candidates`, { params }),
  analyzeAllDriveApplicants: (driveId) => api.post(`/ai/recruiter/drives/${driveId}/analyze-all`),
  getCandidateReport: (driveId, studentId) => api.get(`/ai/recruiter/drives/${driveId}/candidates/${studentId}`),

  // Student Copilot
  getStudentSkillGap: () => api.get('/ai/student/skill-gap'),
  getStudentRoadmap: () => api.get('/ai/student/roadmap'),
  regenerateRoadmap: () => api.post('/ai/student/roadmap/regenerate'),
  toggleRoadmapTask: (weekNumber, taskId) => api.put(`/ai/student/roadmap/weeks/${weekNumber}/tasks/${taskId}/toggle`),
  getStudentDriveMatchReport: (driveId) => api.get(`/ai/student/drives/${driveId}/match-report`),
};

