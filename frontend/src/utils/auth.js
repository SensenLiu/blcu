// 存储 Token
export const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

// 获取 Token
export const getAccessToken = () => {
  return localStorage.getItem('access_token');
};

export const getRefreshToken = () => {
  return localStorage.getItem('refresh_token');
};

// 清除 Token
export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

// 存储用户信息
export const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// 获取用户信息
export const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// 检查是否登录
export const isAuthenticated = () => {
  return !!getAccessToken();
};

// 检查用户角色
export const hasRole = (role) => {
  const user = getUser();
  return user && user.role === role;
};

export const isContestant = () => hasRole('contestant');
export const isJudge = () => hasRole('judge');
export const isAdmin = () => hasRole('admin');
