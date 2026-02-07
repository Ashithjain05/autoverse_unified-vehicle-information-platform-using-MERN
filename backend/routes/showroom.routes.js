import express from 'express';
import { collections, serializeDoc, ObjectId } from '../config/database.js';

const router = express.Router();

/**
 * Generate WhatsApp contact URL
 */
function generateWhatsAppUrl(phone, vehicleName = '', showroomName = '') {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const message = `Hi ${showroomName}, I'm interested in the ${vehicleName} available at your showroom. Can you provide more details?`;
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

// Get all showrooms or filter by criteria
router.get('/', async (req, res) => {
    try {
        const { vehicleSlug, city, brand, type } = req.query;

        const filter = {};

        if (vehicleSlug) {
            filter.vehicle_slug = vehicleSlug;
        }

        if (city) {
            filter.city = { $regex: new RegExp(city, 'i') };
        }

        if (brand) {
            filter.brands = { $in: [brand] };
        }

        if (type) {
            filter.vehicleTypes = { $in: [type] };
        }

        const showrooms = await collections.showrooms()
            .find(filter)
            .limit(50)
            .toArray();

        // Add WhatsApp URLs to each showroom
        const enhanced = showrooms.map(showroom => ({
            ...serializeDoc(showroom),
            whatsappUrl: generateWhatsAppUrl(
                showroom.phone,
                '',
                showroom.name
            )
        }));

        res.json({
            success: true,
            data: enhanced
        });
    } catch (error) {
        console.error('Get showrooms error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch showrooms' });
    }
});

// Get showroom by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const showroom = await collections.showrooms()
            .findOne({ _id: new ObjectId(id) });

        if (!showroom) {
            return res.status(404).json({
                success: false,
                error: 'Showroom not found'
            });
        }

        const enhanced = {
            ...serializeDoc(showroom),
            whatsappUrl: generateWhatsAppUrl(
                showroom.phone,
                '',
                showroom.name
            )
        };

        res.json({
            success: true,
            data: enhanced
        });
    } catch (error) {
        console.error('Get showroom error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch showroom' });
    }
});

export default router;

