export const getHomeByRole = (role) => {
    if (role === 'admin') return '/admin';
    if (role === 'vendor') return '/vendor';
    return '/';
};
