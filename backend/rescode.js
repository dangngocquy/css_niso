const { connectDB } = require('./mongo');
const { v4: uuidv4 } = require('uuid');

exports.getChinhanh = async (req, res) => {
    try {
        const page = parseInt(req.query.page);
        const pageSize = parseInt(req.query.pageSize);

        const collection = await connectDB('RESTAURANTS');
        const total = await collection.countDocuments({});

        let restaurants;
        if (page && pageSize) {
            const skip = (page - 1) * pageSize;
            restaurants = await collection.find({})
                .sort({ _id: -1 })
                .skip(skip)
                .limit(pageSize)
                .toArray();
        } else {
            restaurants = await collection.find({})
                .sort({ _id: -1 })
                .toArray();
        }

        res.json({
            data: restaurants,
            pagination: page && pageSize ? {
                total,
                page,
                pageSize
            } : null
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

exports.postChinhanh = async (req, res) => {
    const { TenChiNhanh, Code, Brand } = req.body;

    try {
        const collection = await connectDB('RESTAURANTS');
        const existingRestaurant = await collection.findOne({ Code });
        if (existingRestaurant) {
            return res.status(400).send('Restaurant code already exists');
        }

        const newRestaurant = {
            id: uuidv4(),
            TenChiNhanh,
            Code,
            Brand
        };

        await collection.insertOne(newRestaurant);
        res.json(newRestaurant);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

exports.deleteChinhanh = async (req, res) => {
    const { id } = req.params;

    try {
        const collection = await connectDB('RESTAURANTS');
        const result = await collection.deleteOne({ id });
        if (result.deletedCount === 0) {
            return res.status(404).send('Restaurant not found');
        }

        res.json({ message: 'Restaurant deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

exports.putChinhanh = async (req, res) => {
    const { id } = req.params;
    const { TenChiNhanh, Code, Brand } = req.body;

    try {
        const collection = await connectDB('RESTAURANTS');
        
        // Kiểm tra xem mã chi nhánh mới có bị trùng không
        const existingRestaurant = await collection.findOne({ Code, id: { $ne: id } });
        if (existingRestaurant) {
            return res.status(400).send('Restaurant code already exists');
        }

        const result = await collection.updateOne(
            { id },
            { $set: { TenChiNhanh, Code, Brand } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send('Restaurant not found');
        }

        res.json({ message: 'Restaurant updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

exports.uploadChinhanh = async (req, res) => {
    const { data } = req.body;

    if (!Array.isArray(data)) {
        return res.status(400).send('Invalid data format. Expected an array.');
    }

    try {
        const collection = await connectDB('RESTAURANTS');
        const bulkOps = data.map(item => ({
            updateOne: {
                filter: { Code: item.Code },
                update: {
                    $set: {
                        id: item.id || uuidv4(),
                        TenChiNhanh: item.TenChiNhanh,
                        Code: item.Code,
                        Brand: item.Brand
                    }
                },
                upsert: true
            }
        }));

        await collection.bulkWrite(bulkOps);
        const restaurants = await collection.find({}).toArray();
        res.json(restaurants);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

exports.downloadChinhanh = async (req, res) => {
    try {
        const collection = await connectDB('RESTAURANTS');
        const restaurants = await collection.find({}).toArray();
        res.setHeader('Content-Disposition', 'attachment; filename=restaurants.json');
        res.setHeader('Content-Type', 'application/json');
        res.json(restaurants);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};