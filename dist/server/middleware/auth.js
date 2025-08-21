import jwt from 'jsonwebtoken';
import { storage } from '../storage';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
export const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token de acesso necessário' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await storage.getUserById(decoded.userId);
        if (!user) {
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }
        req.user = user;
        next();
    }
    catch (error) {
        return res.status(403).json({ error: 'Token inválido' });
    }
};
export const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Permissão insuficiente' });
        }
        next();
    };
};
export const requireAdmin = requireRole(['admin']);
export const requireManagement = requireRole(['admin', 'management']);
export const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};
