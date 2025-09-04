import { Card, Button, Input, Table, Modal, message, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import { RollbackOutlined, SearchOutlined, DeleteOutlined, EditOutlined, CheckOutlined } from '@ant-design/icons';
import { getInput, getPagination, getTableColor } from "./form/Custom";
import { useState, useEffect, useCallback } from "react";
import FormStorageModal from "./form/FormStorageModal";
import UseFormModal from "./form/UseFormModal";
import axios from 'axios';

function FormLuuTru({ user, t }) {
    const navigate = useNavigate();
    const [showFormStorageModal, setShowFormStorageModal] = useState(false);
    const [showUseFormModal, setShowUseFormModal] = useState(false);
    const [editingForm, setEditingForm] = useState(null);
    const [selectedForm, setSelectedForm] = useState(null);
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [currentLang, setCurrentLang] = useState(localStorage.getItem('selectedLanguage') || 'vi');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

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

    const handleGoBack = () => {
        navigate(-1);
    };

    const getClassName = () => {
        if (user.BrandName === 'RuNam' || user.BrandName === "RuNam D'or") {
            return 'custom-search-button';
        } else if (user.BrandName === 'Goody') {
            return 'custom-Goody-button';
        } else if (user.BrandName === 'Ciao Cafe') {
            return 'custom-ciao-button';
        } else if (user.BrandName === 'Nhà hàng Thanh Niên') {
            return 'custom-nhtn-button';
        } else if (user.BrandName === 'Niso') {
            return 'custom-niso-button';
        } else {
            return '';
        }
    };

    const fetchForms = useCallback(async (page, search = '') => {
        try {
            setLoading(true);
            const response = await axios.get('/question/storage/list', {
                params: {
                    page,
                    pageSize: 5,
                    search
                },
                headers: {
                    'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
                }
            });
            if (response.data.success) {
                setForms(response.data.forms);
                setTotalItems(response.data.pagination.total);
            }
        } catch (error) {
            console.error('Lỗi khi lấy danh sách form:', error);
            message.error(error.message || t('cauhoi.Có lỗi xảy ra'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchForms(currentPage, searchText);
    }, [fetchForms, currentPage, searchText]);

    const handleTableChange = (newPagination) => {
        setCurrentPage(newPagination.current);
    };

    const handleDeleteForm = async (id) => {
        Modal.confirm({
            title: t('cauhoi.Xác nhận xóa'),
            content: t('cauhoi.Bạn có chắc chắn muốn xóa form này?'),
            okText: t('cauhoi.Xóa'),
            cancelText: t('cauhoi.Hủy'),
            onOk: async () => {
                try {
                    await axios.delete(`/question/storage/${id}`, {
                        headers: {
                            'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
                        }
                    });
                    message.success(t('cauhoi.Xóa form thành công'));
                    fetchForms(currentPage, searchText);
                } catch (error) {
                    console.error('Lỗi khi xóa form:', error);
                    message.error(t('cauhoi.Có lỗi xảy ra khi xóa form'));
                }
            }
        });
    };

    const handleEditForm = (record) => {
        // Format the record to match FormStorageModal's expected structure
        const formattedRecord = {
            id: record.id,
            formName: record.formName || { vi: '', en: '', kh: '' },
            brandName: record.brandName || null,
            chinhanh: record.chinhanh || '',
            steps: record.steps || [{ step: 1, questions: [] }],
            createdAt: record.createdAt,
            pick: record.pick || false
        };
        setEditingForm(formattedRecord);
        setShowFormStorageModal(true);
    };

    const handleUseForm = (record) => {
        setSelectedForm(record);
        setShowUseFormModal(true);
    };

    const columns = [
        {
            title: t('cauhoi.Tên form'),
            dataIndex: 'formName',
            key: 'formName',
            render: (text) => (
                <span style={{
                    color: user.BrandName === 'Ciao Cafe' ? '#902b8a' :
                        user.BrandName === 'Goody' ? 'rgb(111, 112, 114)' :
                            user.BrandName === 'Nhà hàng Thanh Niên' ? 'rgb(35, 32, 32)' :
                            user.BrandName === 'Niso' ? '#ae8f3d' : '#e0d4bb'
                }}>
                    {getLocalizedText(text)}
                </span>
            )
        },
        {
            title: t('cauhoi.Thương hiệu'),
            dataIndex: 'brandName',
            key: 'brandName',
            render: (text) => {
                if (!text || text === null) return <Tag color="red" bordered={false}>{t('cauhoi.Trống')}</Tag>;

                const brands = Array.isArray(text) ? text : [text];
                if (brands.length === 0) return <Tag color="red" bordered={false}>{t('cauhoi.Trống')}</Tag>;

                const displayStyle = {
                    color: user.BrandName === 'Ciao Cafe' ? '#902b8a' :
                        user.BrandName === 'Goody' ? 'rgb(111, 112, 114)' :
                            user.BrandName === 'Nhà hàng Thanh Niên' ? 'rgb(35, 32, 32)' :
                            user.BrandName === 'Niso' ? '#ae8f3d' : '#e0d4bb'
                };

                if (brands.length === 1) {
                    return (
                        <span style={displayStyle}>
                            {brands[0]}
                        </span>
                    );
                }

                return (
                    <span style={displayStyle}>
                        {brands[0]} {t('cauhoi.và')} {brands.length - 1} {t('cauhoi.thương hiệu khác')}
                    </span>
                );
            }
        },
        {
            title: t('cauhoi.Nhà hàng'),
            dataIndex: 'chinhanh',
            key: 'chinhanh',
            render: (text) => {
                if (!text || text === null) return <Tag color="red" bordered={false}>{t('cauhoi.Trống')}</Tag>;

                const chinhanhs = Array.isArray(text) ? text : [text];
                if (chinhanhs.length === 0) return <Tag color="red" bordered={false}>{t('cauhoi.Trống')}</Tag>;

                const displayStyle = {
                    color: user.BrandName === 'Ciao Cafe' ? '#902b8a' :
                        user.BrandName === 'Goody' ? 'rgb(111, 112, 114)' :
                            user.BrandName === 'Nhà hàng Thanh Niên' ? 'rgb(35, 32, 32)' :
                            user.BrandName === 'Niso' ? '#ae8f3d' : '#e0d4bb'
                };

                if (chinhanhs.length === 1) {
                    return (
                        <span style={displayStyle}>
                            {chinhanhs[0]}
                        </span>
                    );
                }

                return (
                    <span style={displayStyle}>
                        {chinhanhs[0]} {t('cauhoi.và')} {chinhanhs.length - 1} {t('cauhoi.chi nhánh khác')}
                    </span>
                );
            }
        },
        {
            title: 'Step Total',
            key: 'steps',
            render: (_, record) => (
                <span style={{
                    color: user.BrandName === 'Ciao Cafe' ? '#902b8a' :
                        user.BrandName === 'Goody' ? 'rgb(111, 112, 114)' :
                            user.BrandName === 'Nhà hàng Thanh Niên' ? 'rgb(35, 32, 32)' :
                            user.BrandName === 'Niso' ? '#ae8f3d' : '#e0d4bb'
                }}>
                    {record.steps?.length || 0}
                </span>
            )
        },
        {
            title: t('cauhoi.Trạng thái'),
            dataIndex: 'pick',
            key: 'pick',
            render: (text) => <Tag color={text ? 'green' : 'red'} bordered={false}>{text ? t('cauhoi.Đang dùng') : t('cauhoi.Không dùng')}</Tag>
        },
        {
            title: t('cauhoi.Ngày tạo'),
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text) => (
                <span style={{
                    color: user.BrandName === 'Ciao Cafe' ? '#902b8a' :
                        user.BrandName === 'Goody' ? 'rgb(111, 112, 114)' :
                            user.BrandName === 'Nhà hàng Thanh Niên' ? 'rgb(35, 32, 32)' :
                            user.BrandName === 'Niso' ? '#ae8f3d' : '#e0d4bb'
                }}>
                    {new Date(text).toLocaleDateString()}
                </span>
            )
        },
        {
            title: t('cauhoi.Thao tác'),
            key: 'action',
            render: (_, record) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleEditForm(record)}
                        className={`${getClassName()} padding__niso__menu`}
                        size="small"
                    >
                        <p style={{ fontSize: '12px' }}>{t('cauhoi.Sửa')}</p>
                    </Button>
                    <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        onClick={() => handleUseForm(record)}
                        className={`${getClassName()} padding__niso__menu`}
                        size="small"
                    >
                        <p style={{ fontSize: '12px' }}>{t('cauhoi.Sử dụng')}</p>
                    </Button>
                    <Button
                        type="primary"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteForm(record.id)}
                        className={`${getClassName()} padding__niso__menu`}
                        size="small"
                    >
                        <p style={{ fontSize: '12px' }}>{t('cauhoi.Xóa')}</p>
                    </Button>
                </div>
            )
        }
    ];

    const handleSubmit = async () => {
        // Remove direct submission logic as it's handled in FormStorageModal
        setShowFormStorageModal(false);
        setEditingForm(null);
        await fetchForms(currentPage, searchText);
    };

    const filteredForms = forms.filter(form =>
        getLocalizedText(form.formName).toLowerCase().includes(searchText.toLowerCase()) ||
        (form.brandName || '').toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <Card style={{ position: 'relative', zIndex: 3, background: 'transparent', minHeight: '100vh' }}>
            <title>CSS NISO | {t('cauhoi.Form lưu trữ')}</title>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <Button className={`${getClassName()} padding__niso__menu`} size='large' type='primary' onClick={handleGoBack}>
                    <p><RollbackOutlined style={{
                        color: user.BrandName === 'Ciao Cafe'
                            ? '#fff'
                            : user.BrandName === 'Goody'
                                ? 'rgb(241, 132, 174)'
                                : 'var(--color)',
                        fontSize: 18
                    }} /></p>
                </Button>
                <h1 style={{
                    textTransform: 'uppercase',
                    color: user.BrandName === 'Ciao Cafe'
                        ? 'rgb(111, 112, 114)'
                        : user.BrandName === 'Goody'
                            ? 'rgb(111, 112, 114)'
                            : user.BrandName === 'Nhà hàng Thanh Niên'
                                ? 'rgb(35, 32, 32)'
                                : user.BrandName === 'Niso'
                                    ? '#ae8f3d'
                                    : '#ae8f3d',
                    marginBottom: 15
                }}>{t('cauhoi.Danh sách lưu trữ')}</h1>
            </span>
            <Input
                placeholder={t('cauhoi.Tìm kiếm Form')}
                prefix={<SearchOutlined />}
                size="large"
                style={{ marginBottom: 20 }}
                className={`${getInput(user.BrandName)} custom__input2`}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
            />
            <Button
                className={`${getClassName()} padding__niso__menu`}
                size='small'
                type='primary'
                onClick={() => {
                    setEditingForm(null);
                    setShowFormStorageModal(true);
                }}
                style={{ marginBottom: 20 }}
            >
                <p style={{ fontSize: '12px' }}>{t('cauhoi.Thêm form')}</p>
            </Button>

            <Table
                columns={columns}
                dataSource={filteredForms}
                rowKey="id"
                loading={loading}
                pagination={{
                    current: currentPage,
                    pageSize: 5,
                    total: totalItems,
                    showSizeChanger: false,
                    className: `${getPagination(user.BrandName)}`
                }}
                scroll={{ x: true }}
                onChange={handleTableChange}
                className={`${getTableColor(user.BrandName)}`}
                style={{ width: '100%', whiteSpace: 'nowrap', background: 'transparent' }}
            />

            <FormStorageModal
                user={user}
                getClassName={getClassName}
                showFormStorageModal={showFormStorageModal}
                onClose={() => {
                    setShowFormStorageModal(false);
                    setEditingForm(null);
                    fetchForms(currentPage, searchText);
                }}
                t={t}
                onSubmit={handleSubmit}
                editingForm={editingForm}
                isEditQuestion={!!editingForm}
                onUpdate={(updatedForm) => {
                    setForms(prevForms =>
                        prevForms.map(form =>
                            form.id === updatedForm.id ? updatedForm : form
                        )
                    );
                }}
            />

            <UseFormModal
                visible={showUseFormModal}
                onClose={() => {
                    setShowUseFormModal(false);
                    setSelectedForm(null);
                    fetchForms(currentPage, searchText);
                }}
                t={t}
                user={user}
                getClassName={getClassName}
                formData={selectedForm}
            />
        </Card>
    );
}

export default FormLuuTru;