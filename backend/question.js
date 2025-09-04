const { connectDB } = require('./mongo');
const { v4: uuidv4 } = require('uuid');

// Lấy tất cả câu hỏi
exports.getQuestions = async (req, res) => {
    try {
        const { brandName } = req.query;
        const questionsCollection = await connectDB('QUESTIONS');
        const storageCollection = await connectDB('QUESTIONS_STORAGE');
        const stepsCollection = await connectDB('QUESTION_STEPS');

        // Lấy thông tin cơ bản từ QUESTIONS collection
        const basicInfo = await questionsCollection.findOne({ BrandName: brandName });
        const basicFields = basicInfo ? {
            TieuDe: basicInfo.TieuDe,
            Title: basicInfo.Title,
            qt1: basicInfo.qt1,
            qt2: basicInfo.qt2
        } : {};

        // Kiểm tra xem có form storage được chọn không
        const storageForm = await storageCollection.findOne({
            brandName: { $in: Array.isArray(brandName) ? brandName : [brandName] },
            pick: true
        });

        if (storageForm) {
            // Nếu có form storage được chọn, lấy câu hỏi từ QUESTION_STEPS
            const questions = await stepsCollection
                .find({ formId: storageForm.id })
                .sort({ step: 1, createdAt: 1 })
                .toArray();

            // Nhóm câu hỏi theo step
            const steps = questions.reduce((acc, question) => {
                const stepIndex = acc.findIndex(s => s.step === question.step);
                if (stepIndex === -1) {
                    acc.push({
                        step: question.step,
                        questions: [question]
                    });
                } else {
                    acc[stepIndex].questions.push(question);
                }
                return acc;
            }, []);

            return res.json({
                success: true,
                questions: questions,
                steps: steps,
                fromStorage: true,
                id: storageForm.id,
                formName: storageForm.formName || { vi: '', en: '', kh: '' },
                ...basicFields
            });
        }

        // Nếu không có form storage được chọn, lấy câu hỏi từ QUESTIONS như cũ
        const questions = await questionsCollection.find({ BrandName: brandName }).toArray();
        res.json({
            success: true,
            questions: questions,
            fromStorage: false,
            ...basicFields
        });
    } catch (error) {
        console.error('Lỗi khi lấy câu hỏi:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// Lấy câu hỏi theo thương hiệu
exports.getQuestionsByBrand = async (req, res) => {
    try {
        const { brandName } = req.params;
        const { step, resCode } = req.query;
        const questionsCollection = await connectDB('QUESTIONS');
        const storageCollection = await connectDB('QUESTIONS_STORAGE');
        const stepsCollection = await connectDB('QUESTION_STEPS');

        // Kiểm tra xem có form storage được chọn cho brand và chi nhánh không
        if (resCode) {
            const storageForm = await storageCollection.findOne({
                brandName: { $in: Array.isArray(brandName) ? brandName : [brandName] },
                chinhanh: resCode,
                pick: true
            });

            if (storageForm) {
                // Nếu có form storage được chọn, lấy câu hỏi từ QUESTION_STEPS
                const query = { formId: storageForm.id };
                if (step) {
                    query.step = parseInt(step);
                }

                const questions = await stepsCollection
                    .find(query)
                    .sort({ step: 1, createdAt: 1 })
                    .toArray();

                const availableSteps = await stepsCollection
                    .distinct('step', { formId: storageForm.id })
                    .then(steps => steps.sort((a, b) => a - b));

                const formattedQuestions = questions.map(question => ({
                    id: question.id,
                    type: question.type,
                    question: question.question,
                    required: question.required,
                    options: question.options || [],
                    dataType: question.dataType,
                    placeholder: question.placeholder,
                    name: question.name,
                    step: question.step,
                    createdAt: question.createdAt,
                    BrandName: brandName
                }));

                return res.json({
                    questions: formattedQuestions,
                    availableSteps: availableSteps,
                    fromStorage: true
                });
            }
        }

        // Nếu không có form storage hoặc không có resCode, lấy câu hỏi thông thường
        const query = { BrandName: brandName };
        if (step) {
            query.step = parseInt(step);
        }

        const brandQuestions = await questionsCollection
            .find(query)
            .sort({ createdAt: 1 })
            .toArray();

        const availableSteps = await questionsCollection
            .distinct('step', { BrandName: brandName })
            .then(steps => steps.sort((a, b) => a - b));

        const formattedQuestions = brandQuestions.map(question => ({
            id: question.id,
            type: question.type,
            question: question.question,
            required: question.required,
            options: question.options || [],
            dataType: question.dataType,
            placeholder: question.placeholder,
            name: question.name,
            step: question.step,
            createdAt: question.createdAt,
            BrandName: question.BrandName
        }));

        res.json({
            questions: formattedQuestions,
            availableSteps: availableSteps,
            fromStorage: false
        });
    } catch (error) {
        console.error('Lỗi khi lấy câu hỏi theo thương hiệu:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// Cập nhật câu hỏi
exports.putQuestions = async (req, res) => {
    try {
        const { id, BrandName, field, value, itemId, brandId, isBasicField } = req.body;

        if (!id || !BrandName || !field || !value) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin cần thiết'
            });
        }

        // Nếu là các trường cơ bản, lưu vào collection QUESTIONS
        if (isBasicField) {
            const questionsCollection = await connectDB('QUESTIONS');
            const question = await questionsCollection.findOne({ BrandName });

            if (!question) {
                // Nếu chưa có document cho brand này, tạo mới
                await questionsCollection.insertOne({
                    BrandName,
                    [field]: value
                });
            } else {
                // Nếu đã có, cập nhật trường tương ứng
                await questionsCollection.updateOne(
                    { BrandName },
                    { $set: { [field]: value } }
                );
            }

            return res.json({
                success: true,
                message: 'Cập nhật thành công',
                data: { [field]: value }
            });
        }

        // Nếu không phải trường cơ bản, xử lý như cũ
        const collection = await connectDB('QUESTIONS');
        const question = await collection.findOne({ id });

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy câu hỏi'
            });
        }

        const updatedQuestion = await collection.findOneAndUpdate(
            { id },
            { $set: { [field]: value } },
            { returnDocument: 'after' }
        );

        return res.json({
            success: true,
            message: 'Cập nhật thành công',
            data: updatedQuestion
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật câu hỏi:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
};

// Xóa câu hỏi theo thương hiệu
exports.deleteQuestionsByBrand = async (req, res) => {
    try {
        const { brandName, id } = req.params;
        const collection = await connectDB('QUESTIONS');

        const result = await collection.deleteOne({
            BrandName: brandName,
            id
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy câu hỏi để xóa'
            });
        }

        res.json({ message: 'Xóa thành công' });
    } catch (error) {
        console.error('Lỗi khi xóa câu hỏi:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// Tạo câu hỏi tùy chỉnh
exports.postCustomQuestion = async (req, res) => {
    try {
        const { brandName, type, question, required, options, dataType, placeholder, step, content } = req.body;

        if (!brandName) {
            throw new Error('brandName is required');
        }

        const questionMultiLang = typeof question === 'object' ? question : {
            vi: question || '',
            en: '',
            kh: ''
        };

        const questionData = {
            id: uuidv4(),
            type: type,
            question: questionMultiLang,
            content: content || '',
            required: required || false,
            options: options || [],
            BrandName: brandName,
            name: `question_${Math.random().toString(36).substring(2, 11)}`,
            step: parseInt(step) || 1,
            createdAt: new Date().toISOString(),
            placeholder,
            dataType: type === 'text' ? (dataType || 'text') : undefined
        };

        const collection = await connectDB('QUESTIONS');
        await collection.insertOne(questionData);

        res.json({
            success: true,
            message: 'Câu hỏi đã được tạo thành công',
            question: questionData
        });
    } catch (error) {
        console.error('Lỗi khi tạo câu hỏi:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi tạo câu hỏi',
            error: error.message
        });
    }
};

// Lấy nội dung Thank You theo brand
exports.getThankYouContent = async (req, res) => {
    try {
        const brandName = req.query.brand;
        const collection = await connectDB('LOICAMON');

        const query = brandName ? { BrandName: brandName } : {};
        const content = await collection.findOne(query);

        if (brandName && !content) {
            return res.json({
                thankYouText: {
                    vi: 'Cảm ơn quý khách',
                    en: 'Thank you',
                    kh: 'សូមអភ័យទោស'
                },
                contentText: {
                    vi: `Cảm ơn quý khách đã dành thời gian góp ý cho ${brandName}`,
                    en: `Thank you for taking the time to provide feedback for ${brandName}`,
                    kh: `សូមអភ័យទោសសម្រាប់ការចំណាយពេលវេលាផ្តល់មតិត្រឡប់សម្រាប់ ${brandName}`
                }
            });
        }

        // Đảm bảo dữ liệu trả về luôn có cấu trúc đa ngôn ngữ
        const formattedContent = {
            thankYouText: {
                vi: content?.thankYouText?.vi || content?.thankYouText || 'Cảm ơn quý khách',
                en: content?.thankYouText?.en || 'Thank you',
                kh: content?.thankYouText?.kh || 'សូមអភ័យទោស'
            },
            contentText: {
                vi: content?.contentText?.vi || content?.contentText || `Cảm ơn quý khách đã dành thời gian góp ý cho ${brandName}`,
                en: content?.contentText?.en || `Thank you for taking the time to provide feedback for ${brandName}`,
                kh: content?.contentText?.kh || `សូមអភ័យទោសសម្រាប់ការចំណាយពេលវេលាផ្តល់មតិត្រឡប់សម្រាប់ ${brandName}`
            }
        };

        res.json(formattedContent);
    } catch (error) {
        console.error('Lỗi khi đọc nội dung Thank You:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi đọc nội dung',
            error: error.message
        });
    }
};

// Lưu nội dung Thank You
exports.saveThankYouContent = async (req, res) => {
    try {
        const { brandName, thankYouText, contentText } = req.body;
        const collection = await connectDB('LOICAMON');

        // Đảm bảo dữ liệu có cấu trúc đa ngôn ngữ
        const formattedThankYouText = {
            vi: thankYouText?.vi || thankYouText || '',
            en: thankYouText?.en || '',
            kh: thankYouText?.kh || ''
        };

        const formattedContentText = {
            vi: contentText?.vi || contentText || '',
            en: contentText?.en || '',
            kh: contentText?.kh || ''
        };

        const updateData = {
            BrandName: brandName,
            thankYouText: formattedThankYouText,
            contentText: formattedContentText,
            updatedAt: new Date().toISOString()
        };

        const result = await collection.updateOne(
            { BrandName: brandName },
            { $set: updateData },
            { upsert: true }
        );

        res.json({
            success: true,
            message: 'Đã lưu nội dung thành công',
            data: updateData
        });
    } catch (error) {
        console.error('Lỗi khi lưu nội dung Thank You:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lưu nội dung',
            error: error.message
        });
    }
};

// Cập nhật câu hỏi tùy chỉnh
exports.updateCustomQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!id || !updateData) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin cần thiết'
            });
        }

        const collection = await connectDB('QUESTIONS');
        const existingQuestion = await collection.findOne({ id });

        if (!existingQuestion) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy câu hỏi'
            });
        }

        const updatedQuestion = {
            ...existingQuestion,
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        const result = await collection.updateOne(
            { id },
            { $set: updatedQuestion }
        );

        if (result.modifiedCount === 0) {
            return res.status(400).json({
                success: false,
                message: 'Không thể cập nhật câu hỏi'
            });
        }

        res.json({
            success: true,
            message: 'Cập nhật thành công',
            data: updatedQuestion
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật câu hỏi:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
};

// Thêm form lưu trữ mới
exports.addFormStorage = async (req, res) => {
    try {
        const { formName, brandName, chinhanh, steps, pick } = req.body;
        const storageCollection = await connectDB('QUESTIONS_STORAGE');
        const stepsCollection = await connectDB('QUESTION_STEPS');

        const formId = uuidv4();
        const formData = {
            id: formId,
            formName,
            brandName: null,
            chinhanh: null,
            createdAt: new Date().toISOString(),
            pick: pick || false
        };

        // Lưu form vào QUESTIONS_STORAGE
        await storageCollection.insertOne(formData);

        // Lưu câu hỏi vào QUESTION_STEPS
        for (const step of steps) {
            const stepQuestions = step.questions.map(q => ({
                ...q,
                id: uuidv4(),
                formId: formId,
                step: step.step,
                createdAt: new Date().toISOString()
            }));
            await stepsCollection.insertMany(stepQuestions);
        }

        res.json({
            success: true,
            message: 'Form lưu trữ đã được tạo thành công',
            form: {
                ...formData,
                steps: steps
            }
        });
    } catch (error) {
        console.error('Lỗi khi tạo form lưu trữ:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi tạo form lưu trữ',
            error: error.message
        });
    }
};

// Lấy danh sách form lưu trữ
exports.getFormStorage = async (req, res) => {
    try {
        const { page = 1, pageSize = 5, search = '' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(pageSize);

        const storageCollection = await connectDB('QUESTIONS_STORAGE');
        const stepsCollection = await connectDB('QUESTION_STEPS');

        // Tạo query tìm kiếm
        let query = {};
        if (search) {
            query = {
                $or: [
                    { 'formName.vi': { $regex: search, $options: 'i' } },
                    { 'formName.en': { $regex: search, $options: 'i' } },
                    { 'formName.kh': { $regex: search, $options: 'i' } },
                    { brandName: { $regex: search, $options: 'i' } },
                    { chinhanh: { $regex: search, $options: 'i' } }
                ]
            };
        }

        // Đếm tổng số form với điều kiện tìm kiếm
        const totalForms = await storageCollection.countDocuments(query);

        const forms = await storageCollection
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(pageSize))
            .toArray();

        // Lấy câu hỏi cho từng form
        const formsWithSteps = await Promise.all(forms.map(async (form) => {
            const questions = await stepsCollection
                .find({ formId: form.id })
                .sort({ step: 1, createdAt: 1 })
                .toArray();

            // Nhóm câu hỏi theo step
            const steps = questions.reduce((acc, question) => {
                const stepIndex = acc.findIndex(s => s.step === question.step);
                if (stepIndex === -1) {
                    acc.push({
                        step: question.step,
                        questions: [question]
                    });
                } else {
                    acc[stepIndex].questions.push(question);
                }
                return acc;
            }, []);

            return {
                ...form,
                steps
            };
        }));

        res.json({
            success: true,
            forms: formsWithSteps,
            pagination: {
                total: totalForms,
                pageSize: parseInt(pageSize),
                current: parseInt(page)
            }
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách form lưu trữ:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// Xóa form lưu trữ
exports.deleteFormStorage = async (req, res) => {
    try {
        const { id } = req.params;
        const storageCollection = await connectDB('QUESTIONS_STORAGE');
        const stepsCollection = await connectDB('QUESTION_STEPS');

        // Xóa form trong QUESTIONS_STORAGE
        const result = await storageCollection.deleteOne({ id });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy form lưu trữ để xóa'
            });
        }

        // Xóa các câu hỏi trong QUESTION_STEPS
        await stepsCollection.deleteMany({ formId: id });

        res.json({
            success: true,
            message: 'Xóa form lưu trữ thành công'
        });
    } catch (error) {
        console.error('Lỗi khi xóa form lưu trữ:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// Cập nhật form lưu trữ
exports.updateFormStorage = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!id || !updateData) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin cần thiết'
            });
        }

        const storageCollection = await connectDB('QUESTIONS_STORAGE');
        const stepsCollection = await connectDB('QUESTION_STEPS');

        // Kiểm tra xem đây có phải là cập nhật câu hỏi đơn lẻ không
        if (updateData.id && updateData.formId) {
            // Cập nhật câu hỏi trong QUESTION_STEPS
            const result = await stepsCollection.updateOne(
                { id: updateData.id },
                {
                    $set: {
                        ...updateData,
                        updatedAt: new Date().toISOString()
                    }
                }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy câu hỏi cần cập nhật'
                });
            }

            return res.json({
                success: true,
                message: 'Cập nhật câu hỏi thành công'
            });
        }

        const existingForm = await storageCollection.findOne({ id });

        if (!existingForm) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy form lưu trữ'
            });
        }

        // Cập nhật thông tin form trong QUESTIONS_STORAGE
        const updatedForm = {
            ...existingForm,
            formName: updateData.formName || existingForm.formName,
            brandName: updateData.brandName === null ? null : (Array.isArray(updateData.brandName) ? updateData.brandName : [updateData.brandName]),
            chinhanh: Array.isArray(updateData.chinhanh) ? updateData.chinhanh : [],
            pick: updateData.pick !== undefined ? updateData.pick : existingForm.pick,
            updatedAt: new Date().toISOString()
        };

        await storageCollection.updateOne(
            { id },
            { $set: updatedForm }
        );

        // Nếu có steps trong updateData, cập nhật lại các câu hỏi
        if (updateData.steps && Array.isArray(updateData.steps)) {
            // Xóa các câu hỏi cũ trong QUESTION_STEPS
            await stepsCollection.deleteMany({ formId: id });

            // Thêm các câu hỏi mới vào QUESTION_STEPS
            for (const step of updateData.steps) {
                if (step.questions && Array.isArray(step.questions)) {
                    const stepQuestions = step.questions.map(q => ({
                        ...q,
                        id: q.id || uuidv4(),
                        formId: id,
                        step: step.step,
                        createdAt: q.createdAt || new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }));
                    await stepsCollection.insertMany(stepQuestions);
                }
            }
        }

        res.json({
            success: true,
            message: 'Cập nhật form lưu trữ thành công',
            form: {
                ...updatedForm,
                steps: updateData.steps || existingForm.steps
            }
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật form lưu trữ:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
};

// Lấy form storage theo brand và chi nhánh
exports.getFormStorageByBrandAndBranch = async (req, res) => {
    try {
        const { brandName, resCode } = req.query;

        if (!brandName || !resCode) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin brandName hoặc resCode'
            });
        }

        const storageCollection = await connectDB('QUESTIONS_STORAGE');
        const stepsCollection = await connectDB('QUESTION_STEPS');

        const forms = await storageCollection
            .find({
                brandName: brandName,
                chinhanh: { $in: [resCode] },
                pick: true
            })
            .sort({ createdAt: -1 })
            .toArray();

        // Lấy câu hỏi cho từng form
        const formsWithSteps = await Promise.all(forms.map(async (form) => {
            const questions = await stepsCollection
                .find({ formId: form.id })
                .sort({ step: 1, createdAt: 1 })
                .toArray();

            // Nhóm câu hỏi theo step
            const steps = questions.reduce((acc, question) => {
                const stepIndex = acc.findIndex(s => s.step === question.step);
                if (stepIndex === -1) {
                    acc.push({
                        step: question.step,
                        questions: [question]
                    });
                } else {
                    acc[stepIndex].questions.push(question);
                }
                return acc;
            }, []);

            return {
                ...form,
                steps
            };
        }));

        res.json({
            success: true,
            forms: formsWithSteps
        });
    } catch (error) {
        console.error('Lỗi khi lấy form storage theo brand và chi nhánh:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
};

// Gộp API lấy câu hỏi và form lưu trữ
exports.getCombinedQuestions = async (req, res) => {
    try {
        const { brandName, resCode } = req.query;

        if (!brandName) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin brandName'
            });
        }

        const storageCollection = await connectDB('QUESTIONS_STORAGE');

        let storageForms = [];
        if (resCode) {
            storageForms = await storageCollection
                .find({
                    brandName: brandName,
                    chinhanh: resCode,
                    pick: true
                })
                .sort({ createdAt: -1 })
                .toArray();
        }

        res.json({
            success: true,
            storageForms
        });
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu kết hợp:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
};

// Lấy dữ liệu câu hỏi từ QUESTION_STEPS
exports.getQuestionFromSteps = async (req, res) => {
    try {
        const { questionId } = req.params;
        const stepsCollection = await connectDB('QUESTION_STEPS');
        const storageCollection = await connectDB('QUESTIONS_STORAGE');

        // Tìm câu hỏi trong QUESTION_STEPS
        const question = await stepsCollection.findOne({ id: questionId });

        if (!question) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy câu hỏi'
            });
        }

        // Lấy thông tin form từ QUESTIONS_STORAGE
        const form = await storageCollection.findOne({ id: question.formId });

        if (!form) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy form'
            });
        }

        // Lấy tất cả câu hỏi trong cùng step
        const allQuestionsInStep = await stepsCollection
            .find({
                formId: question.formId,
                step: question.step
            })
            .sort({ createdAt: 1 })
            .toArray();

        // Trả về đầy đủ thông tin cần thiết
        res.json({
            success: true,
            question: {
                ...question,
                BrandName: form.brandName,
                fromStorage: true
            },
            step: question.step,
            formId: form.id,
            formName: form.formName,
            allQuestionsInStep: allQuestionsInStep // Thêm tất cả câu hỏi trong cùng step
        });
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu câu hỏi:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// Cập nhật câu hỏi trong QUESTION_STEPS
exports.updateQuestionInSteps = async (req, res) => {
    try {
        const { questionId } = req.params;
        const updateData = req.body;
        const stepsCollection = await connectDB('QUESTION_STEPS');

        // Tìm và cập nhật câu hỏi
        const result = await stepsCollection.updateOne(
            { id: questionId },
            {
                $set: {
                    ...updateData,
                    updatedAt: new Date().toISOString()
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy câu hỏi cần cập nhật'
            });
        }

        res.json({
            success: true,
            message: 'Cập nhật câu hỏi thành công'
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật câu hỏi:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
};

// Sao chép step từ form này sang form khác
exports.copyStep = async (req, res) => {
    try {
        const { sourceFormId, targetFormId, sourceStep, targetStep } = req.body;

        if (!sourceFormId || !targetFormId || !sourceStep || !targetStep) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin cần thiết'
            });
        }

        const stepsCollection = await connectDB('QUESTION_STEPS');
        const storageCollection = await connectDB('QUESTIONS_STORAGE');

        // Kiểm tra xem form nguồn và form đích có tồn tại không
        const [sourceForm, targetForm] = await Promise.all([
            storageCollection.findOne({ id: sourceFormId }),
            storageCollection.findOne({ id: targetFormId })
        ]);

        if (!sourceForm || !targetForm) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy form nguồn hoặc form đích'
            });
        }

        // Lấy tất cả câu hỏi từ step nguồn
        const sourceQuestions = await stepsCollection
            .find({
                formId: sourceFormId,
                step: parseInt(sourceStep)
            })
            .sort({ createdAt: 1 })
            .toArray();

        if (sourceQuestions.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy câu hỏi trong step nguồn'
            });
        }

        // Kiểm tra xem step đích đã có dữ liệu chưa
        const existingTargetQuestions = await stepsCollection
            .find({
                formId: targetFormId,
                step: parseInt(targetStep)
            })
            .toArray();

        // Tạo bản sao của các câu hỏi với ID mới
        const newQuestions = sourceQuestions.map(question => {
            const { _id, ...questionWithoutId } = question; // Loại bỏ _id
            return {
                ...questionWithoutId,
                id: uuidv4(), // Tạo ID mới
                formId: targetFormId,
                step: parseInt(targetStep),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
        });

        // Nếu step đích đã có dữ liệu, xóa dữ liệu cũ
        if (existingTargetQuestions.length > 0) {
            await stepsCollection.deleteMany({
                formId: targetFormId,
                step: parseInt(targetStep)
            });
        }

        // Thêm các câu hỏi mới vào step đích
        await stepsCollection.insertMany(newQuestions);

        res.json({
            success: true,
            message: 'Sao chép step thành công',
            data: {
                sourceStep: parseInt(sourceStep),
                targetStep: parseInt(targetStep),
                questions: newQuestions
            }
        });
    } catch (error) {
        console.error('Lỗi khi sao chép step:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
};

