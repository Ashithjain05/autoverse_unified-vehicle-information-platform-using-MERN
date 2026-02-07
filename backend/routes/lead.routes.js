import express from 'express';
import { collections, serializeDoc, ObjectId } from '../config/database.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create lead (protected route)
router.post('/', verifyToken, async (req, res) => {
    try {
        const { vehicleId, city, type, preferredTime } = req.body;
        const userId = req.user.userId;

        if (!vehicleId || !city || !type) {
            return res.status(400).json({
                success: false,
                error: 'Vehicle ID, city, and type are required'
            });
        }

        const lead = {
            user_id: new ObjectId(userId),
            vehicle_id: new ObjectId(vehicleId),
            city,
            type, // 'call', 'callback', 'save'
            preferred_time: preferredTime,
            status: 'pending',
            created_at: new Date()
        };

        const result = await collections.leads().insertOne(lead);

        res.json({
            success: true,
            message: 'Lead created successfully',
            data: serializeDoc({ ...lead, _id: result.insertedId })
        });
    } catch (error) {
        console.error('Create lead error:', error);
        res.status(500).json({ success: false, error: 'Failed to create lead' });
    }
});

// Get user's leads (protected route)
router.get('/my-leads', verifyToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const leads = await collections.leads()
            .find({ user_id: new ObjectId(userId) })
            .sort({ created_at: -1 })
            .toArray();

        res.json({
            success: true,
            data: serializeDoc(leads)
        });
    } catch (error) {
        console.error('Get leads error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch leads' });
    }
});

export default router;
