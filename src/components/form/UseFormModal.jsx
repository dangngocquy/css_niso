import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Form, Select, message } from 'antd';
import axios from 'axios';
import { getModal, getSelect, getquestion2 } from './Custom';

const UseFormModal = ({ visible, onClose, t, user, getClassName, formData }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [chinhanhList, setChinhanhList] = useState([]);
    const [filteredChinhanh, setFilteredChinhanh] = useState([]);
    const [currentLang, setCurrentLang] = useState(localStorage.getItem('selectedLanguage') || 'vi');

    useEffect(() => {
        const handleLanguageChange = () => {
            const newLang = localStorage.getItem('selectedLanguage') || 'vi';
            setCurrentLang(newLang);
        };

        window.addEventListener('storage', handleLanguageChange);
        return () => window.removeEventListener('storage', handleLanguageChange);
    }, []);

    const getLocalizedText = (text) => {
        if (!text) return '';
        if (typeof text === 'object') {
            return text[currentLang] || text.vi || '';
        }
        return text;
    };

    const fetchChinhanh = useCallback(async () => {
        try {
            const response = await axios.get('/chinhanh/all', {
                headers: {
                    'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
                }
            });
            setChinhanhList(response.data.data);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu chi nhánh:', error);
            message.error(t('cauhoi.Không thể lấy dữ liệu chi nhánh'));
        }
    }, [t]);

    // Thêm hàm kiểm tra form đang được sử dụng
    const checkExistingForm = async (brandNames, chinhanhs) => {
        try {
            const response = await axios.get('/question/storage/list', {
                params: {
                    brandName: brandNames,
                },
                headers: {
                    'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
                }
            });

            if (response.data.success) {
                const existingForms = response.data.forms.filter(form =>
                    form.pick &&
                    form.id !== formData.id &&
                    brandNames.some(brand => form.brandName.includes(brand)) &&
                    chinhanhs.some(ch => form.chinhanh.includes(ch))
                );

                if (existingForms.length > 0) {
                    // Tạo thông báo chi tiết về các form đang sử dụng
                    const formDetails = existingForms.map(form => {
                        const commonBrands = form.brandName.filter(brand => brandNames.includes(brand));
                        const commonChinhanhs = form.chinhanh.filter(ch => chinhanhs.includes(ch));
                        return {
                            formName: getLocalizedText(form.formName),
                            brands: commonBrands.join(', '),
                            chinhanhs: commonChinhanhs.join(', ')
                        };
                    });

                    return {
                        hasConflict: true,
                        details: formDetails
                    };
                }
            }
            return { hasConflict: false };
        } catch (error) {
            console.error('Lỗi khi kiểm tra form đang sử dụng:', error);
            return { hasConflict: false };
        }
    };

    useEffect(() => {
        if (visible) {
            fetchChinhanh();
            if (formData) {
                const brandNames = Array.isArray(formData.brandName) ? formData.brandName : (formData.brandName ? [formData.brandName] : []);
                form.setFieldsValue({
                    brandName: brandNames,
                    chinhanh: Array.isArray(formData.chinhanh) ? formData.chinhanh : (formData.chinhanh ? [formData.chinhanh] : [])
                });
                setSelectedBrands(brandNames);
            }
        }
    }, [visible, fetchChinhanh, formData, form]);

    useEffect(() => {
        if (selectedBrands.length > 0 && chinhanhList.length > 0) {
            const filtered = chinhanhList.filter(item => selectedBrands.includes(item.Brand));
            setFilteredChinhanh(filtered);
        } else {
            setFilteredChinhanh([]);
        }
    }, [selectedBrands, chinhanhList]);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            await form.validateFields();

            const currentValues = form.getFieldsValue();
            
            // Nếu không có thương hiệu, set tất cả về null
            if (!currentValues.brandName || currentValues.brandName.length === 0) {
                const payload = {
                    brandName: null,
                    chinhanh: null,
                    pick: false,
                    formName: formData.formName,
                    steps: formData.steps
                };

                await axios.put(`/question/storage/${formData.id}`, payload, {
                    headers: {
                        'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
                    }
                });

                // Cập nhật FormName trong databaseAccount về null
                await axios.put('/usersAccount/updateFormName', {
                    brandNames: null,
                    formId: null
                }, {
                    headers: {
                        'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
                    }
                });

                message.success(t('cauhoi.Cập nhật form thành công'));
                onClose();
                return;
            }

            const selectedChinhanhs = Array.isArray(currentValues.chinhanh) ? currentValues.chinhanh : [currentValues.chinhanh];

            // Kiểm tra form đang được sử dụng
            const checkResult = await checkExistingForm(currentValues.brandName, selectedChinhanhs);

            if (checkResult.hasConflict) {
                // Tạo nội dung thông báo chi tiết
                const conflictDetails = checkResult.details.map(detail => 
                    `${t('cauhoi.Form')}: ${detail.formName}\n` +
                    `${t('cauhoi.Thương hiệu')}: ${detail.brands}\n` +
                    `${t('cauhoi.Nhà hàng')}: ${detail.chinhanhs}`
                ).join('\n\n');

                Modal.confirm({
                    title: 'Warning',
                    content: (
                        <div>
                            <p>{t('cauhoi.Các thương hiệu và chi nhánh sau đã được áp dụng cho form khác:')}</p>
                            <pre style={{ 
                                whiteSpace: 'pre-wrap', 
                                wordWrap: 'break-word',
                                backgroundColor: '#f5f5f5',
                                padding: '10px',
                                borderRadius: '4px',
                                marginTop: '10px'
                            }}>
                                {conflictDetails}
                            </pre>
                            <p>{t('cauhoi.Thương hiệu và chi nhánh này đã được áp dụng cho form khác. Bạn có muốn tiếp tục không?')}</p>
                        </div>
                    ),
                    okText: t('cauhoi.Tiếp tục'),
                    cancelText: t('cauhoi.Hủy'),
                    onCancel: () => {
                        setLoading(false);
                    },
                    onOk: async () => {
                        try {
                            // Lấy danh sách form đang được sử dụng
                            const response = await axios.get('/question/storage/list', {
                                params: {
                                    brandName: currentValues.brandName,
                                },
                                headers: {
                                    'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
                                }
                            });

                            if (response.data.success) {
                                // Tìm và reset các form đang được sử dụng
                                const existingForms = response.data.forms.filter(form =>
                                    form.pick &&
                                    form.id !== formData.id &&
                                    currentValues.brandName.some(brand => form.brandName.includes(brand)) &&
                                    selectedChinhanhs.some(ch => form.chinhanh.includes(ch))
                                );

                                // Xóa chi nhánh đã chọn khỏi các form cũ
                                for (const existingForm of existingForms) {
                                    const updatedChinhanh = Array.isArray(existingForm.chinhanh) 
                                        ? existingForm.chinhanh.filter(ch => !selectedChinhanhs.includes(ch))
                                        : [];

                                    await axios.put(`/question/storage/${existingForm.id}`, {
                                        brandName: updatedChinhanh.length > 0 ? existingForm.brandName : null,
                                        chinhanh: updatedChinhanh,
                                        pick: updatedChinhanh.length > 0,
                                        formName: existingForm.formName,
                                        steps: existingForm.steps
                                    }, {
                                        headers: {
                                            'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
                                        }
                                    });

                                    // Cập nhật FormName trong databaseAccount về null cho các form cũ
                                    if (updatedChinhanh.length === 0) {
                                        await axios.put('/usersAccount/updateFormName', {
                                            brandNames: existingForm.brandName,
                                            formId: null
                                        }, {
                                            headers: {
                                                'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
                                            }
                                        });
                                    }
                                }
                            }

                            // Tạo form mới với các chi nhánh đã chọn
                            const payload = {
                                brandName: currentValues.brandName,
                                chinhanh: selectedChinhanhs,
                                pick: true,
                                formName: formData.formName,
                                steps: formData.steps
                            };

                            await axios.put(`/question/storage/${formData.id}`, payload, {
                                headers: {
                                    'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
                                }
                            });

                            // Cập nhật FormName trong databaseAccount cho form mới
                            await axios.put('/usersAccount/updateFormName', {
                                brandNames: currentValues.brandName,
                                formId: formData.id,
                                chinhanhs: selectedChinhanhs
                            }, {
                                headers: {
                                    'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
                                }
                            });

                            message.success(t('cauhoi.Cập nhật form thành công'));
                            onClose();
                        } catch (error) {
                            console.error('Lỗi khi cập nhật form:', error);
                            message.error(error.message || t('cauhoi.Có lỗi xảy ra'));
                        }
                    }
                });
                return;
            }

            // Nếu không có form đang sử dụng, gửi tất cả chi nhánh trong một request
            const payload = {
                brandName: currentValues.brandName,
                chinhanh: selectedChinhanhs,
                pick: true,
                formName: formData.formName,
                steps: formData.steps
            };

            await axios.put(`/question/storage/${formData.id}`, payload, {
                headers: {
                    'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
                }
            });

            // Cập nhật FormName trong databaseAccount
            await axios.put('/usersAccount/updateFormName', {
                brandNames: currentValues.brandName,
                formId: formData.id,
                chinhanhs: selectedChinhanhs
            }, {
                headers: {
                    'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
                }
            });

            message.success(t('cauhoi.Cập nhật form thành công'));
            onClose();
        } catch (error) {
            console.error('Lỗi khi cập nhật form:', error);
            message.error(error.message || t('cauhoi.Có lỗi xảy ra'));
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        form.resetFields();
        setSelectedBrands([]);
        onClose();
    };

    const handleBrandChange = (values) => {
        setSelectedBrands(values);
        if (!values || values.length === 0) {
            form.setFieldsValue({
                brandName: [],
                chinhanh: []
            });
            // Cập nhật form với pick: false khi không có thương hiệu
            const payload = {
                brandName: null,
                chinhanh: [],
                pick: false,
                formName: formData.formName,
                steps: formData.steps
            };
            axios.put(`/question/storage/${formData.id}`, payload, {
                headers: {
                    'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
                }
            }).catch(error => {
                console.error('Lỗi khi cập nhật form:', error);
                message.error(error.message || t('cauhoi.Có lỗi xảy ra'));
            });
        }
    };

    return (
        <Modal
            title={t('cauhoi.Áp dụng form')}
            open={visible}
            onCancel={handleClose}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText={<p>{t('cauhoi.Áp dụng')}</p>}
            cancelText={<p>{t('cauhoi.Hủy')}</p>}
            className={`${getModal(user.BrandName)}`}
            okButtonProps={{
                className: `${getClassName(user.BrandName)} static button-full-width`
            }}
            cancelButtonProps={{
                className: `${getClassName(user.BrandName)} static button-full-width`
            }}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    label={<span className={getquestion2(user.BrandName)}>{t('cauhoi.Chọn thương hiệu')}</span>}
                    name="brandName"
                >
                    <Select
                        className={getSelect(user.BrandName)}
                        value={selectedBrands}
                        onChange={handleBrandChange}
                        placeholder={t('cauhoi.Chọn thương hiệu')}
                        mode="multiple"
                        allowClear
                        maxTagCount={3}
                        maxTagTextLength={10}
                        maxTagPlaceholder={(omittedValues) => `+ ${omittedValues.length} ${t('cauhoi.thương hiệu khác')}`}
                    >
                        <Select.Option value="RuNam">RUNAM</Select.Option>
                        <Select.Option value="RuNam D'or">RUNAM D'OR</Select.Option>
                        <Select.Option value="Goody">GOODY</Select.Option>
                        <Select.Option value="Ciao Cafe">CIAO CAFE</Select.Option>
                        <Select.Option value="Nhà hàng Thanh Niên">NHÀ HÀNG THANH NIÊN</Select.Option>
                    </Select>
                </Form.Item>

                {selectedBrands.length > 0 && filteredChinhanh.length > 0 && (
                    <Form.Item
                        label={<span className={getquestion2(user.BrandName)}>{t('cauhoi.Chọn chi nhánh')}</span>}
                        name="chinhanh"
                        rules={[{ required: true, message: t('cauhoi.Vui lòng chọn chi nhánh') }]}
                    >
                        <Select
                            className={getSelect(user.BrandName)}
                            placeholder={t('cauhoi.Chọn chi nhánh')}
                            style={{ width: '100%' }}
                            mode="multiple"
                            allowClear
                            maxTagCount={3}
                            maxTagTextLength={10}
                            maxTagPlaceholder={(omittedValues) => `+ ${omittedValues.length} ${t('cauhoi.chi nhánh khác')}`}
                        >
                            {filteredChinhanh.map(item => (
                                <Select.Option key={item.id} value={item.TenChiNhanh}>
                                    {item.TenChiNhanh}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                )}
            </Form>
            <div style={{ textAlign: 'left' }}>Note: {t('cauhoi.Chức năng này chỉ áp dụng với những nhà hàng được chọn, khi chọn thương hiệu vui lòng chọn nhà hàng để áp dụng')}.</div>
        </Modal>
    );
};

export default UseFormModal; 