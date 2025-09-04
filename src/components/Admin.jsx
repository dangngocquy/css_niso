import React, { useState, useEffect, useCallback } from 'react';
import { Drawer, Form, Button, Input, Select, Table, Space, Switch, message, Popconfirm, Tag, Card, notification, Upload } from 'antd';
import axios from 'axios';
import { SearchOutlined, RollbackOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import GoodyLogo from '../asset/Goody.svg';
import RunamDorLogo from '../asset/RUNAMDOR.svg';
import RunamLogo from '../asset/RUNAM.svg';
import CiaoLogo from '../asset/Ciao.svg';
import NisoLogo from '../asset/Logo.svg';
import ThanhnienLogo from '../asset/Thanh_nien.svg';
import { getTableColor, getSelect, getquestion2, getDraw, getInput, getPopup, getPagination } from './form/Custom';

const Admin = ({ user, t }) => {
    const [users, setUsers] = useState([]);
    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();
    const [diadiem, setDiadiem] = useState([]);
    const [editUser, setEditUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filteredBranches, setFilteredBranches] = useState([]);
    const [forms, setForms] = useState([]);

    const showDrawer = () => {
        setVisible(true);
    };

    useEffect(() => {
        const fetchChinhanh = async () => {
            try {
                const response = await axios.get('/chinhanh/all', {
                    headers: {
                        'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
                    }
                });
                const data = Array.isArray(response.data.data) ? response.data.data : [];
                setDiadiem(data);
                if (!data.some(item => item.Brand)) {
                    notification.warning({
                        message: 'Cảnh báo',
                        description: 'Vui lòng vào cửa hàng thêm thương hiệu để tiếp tục.',
                    });
                }
            } catch (error) {
                console.error('Error fetching chinhanh:', error);
                setDiadiem([]);
                notification.error({
                    message: 'Lỗi',
                    description: 'Không thể lấy dữ liệu !',
                });
            }
        };
        fetchChinhanh();
    }, []);

    const onClose = () => {
        setVisible(false);
        setEditUser(null);
        form.resetFields();
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/users/all', {
                headers: {
                    'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
                }
            });
            setUsers(response.data);
            setFilteredUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            message.error('Lỗi khi tải dữ liệu người dùng!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const filteredData = users.filter(user =>
            user.Email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(filteredData);
    }, [searchTerm, users]);

    const fetchForms = useCallback(async () => {
        try {
            const response = await axios.get('/question/storage/list', {
                headers: {
                    'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
                }
            });
            if (response.data.success) {
                setForms(response.data.forms);
            }
        } catch (error) {
            console.error('Lỗi khi lấy danh sách form:', error);
            message.error(t('cauhoi.Không thể lấy danh sách form'));
        }
    }, [t]);

    useEffect(() => {
        fetchForms();
    }, [fetchForms]);

    const onFinish = async (values) => {
        try {
            const headers = {
                'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
            };

            const selectedForm = forms.find(f => f.id === values.selectedFormId);
            if (selectedForm) {
                // Lấy thông tin form hiện tại từ QUESTIONS_STORAGE
                const response = await axios.get('/question/storage/list', {
                    params: {
                        brandName: selectedForm.brandName,
                    },
                    headers
                });

                let existingChinhanhs = [];
                let existingBrandNames = [];
                if (response.data.success) {
                    const existingForm = response.data.forms.find(form => form.id === selectedForm.id);
                    if (existingForm) {
                        existingChinhanhs = Array.isArray(existingForm.chinhanh) ? existingForm.chinhanh : [];
                        existingBrandNames = Array.isArray(existingForm.brandName) ? existingForm.brandName : [];
                    }
                }

                // Thêm chi nhánh mới vào danh sách hiện có
                const updatedChinhanhs = [...new Set([...existingChinhanhs, values.ResCode])];
                // Thêm thương hiệu mới vào danh sách hiện có
                const updatedBrandNames = [...new Set([...existingBrandNames, values.BrandName])];

                // Cập nhật form trong QUESTIONS_STORAGE
                const payload = {
                    id: selectedForm.id,
                    brandName: updatedBrandNames,
                    chinhanh: updatedChinhanhs,
                    pick: true,
                    formName: selectedForm.formName,
                    steps: selectedForm.steps
                };

                // Kiểm tra form đang được sử dụng
                const checkResult = await checkExistingForm(updatedBrandNames, updatedChinhanhs);

                if (checkResult.hasConflict) {
                    try {
                        // Lấy danh sách form đang được sử dụng
                        const response = await axios.get('/question/storage/list', {
                            params: {
                                brandName: updatedBrandNames,
                            },
                            headers
                        });

                        if (response.data.success) {
                            // Tìm và reset các form đang được sử dụng
                            const existingForms = response.data.forms.filter(form =>
                                form.pick &&
                                form.id !== selectedForm.id &&
                                updatedBrandNames.some(brand => form.brandName.includes(brand)) &&
                                updatedChinhanhs.some(ch => form.chinhanh.includes(ch))
                            );

                            // Xóa chi nhánh đã chọn khỏi các form cũ
                            for (const existingForm of existingForms) {
                                const updatedChinhanh = Array.isArray(existingForm.chinhanh) 
                                    ? existingForm.chinhanh.filter(ch => !updatedChinhanhs.includes(ch))
                                    : [];

                                await axios.put(`/question/storage/${existingForm.id}`, {
                                    id: existingForm.id,
                                    brandName: updatedChinhanh.length > 0 ? existingForm.brandName : null,
                                    chinhanh: updatedChinhanh,
                                    pick: updatedChinhanh.length > 0,
                                    formName: existingForm.formName,
                                    steps: existingForm.steps
                                }, { headers });
                            }
                        }

                        // Cập nhật form mới
                        await axios.put(`/question/storage/${selectedForm.id}`, payload, { headers });

                        // Cập nhật thông tin người dùng trong SQL Server
                        const userPayload = {
                            ...values,
                            brandName: updatedBrandNames,
                            chinhanh: updatedChinhanhs,
                            pick: true,
                            FormName: selectedForm.id
                        };

                        if (editUser) {
                            await axios.put(`/users/update/${editUser.keys}`, userPayload, { headers });
                        } else {
                            await axios.post('/users/add', userPayload, { headers });
                        }

                        message.success(t('cauhoi.Thành công'));
                        onClose();
                        fetchData();
                    } catch (error) {
                        console.error('Lỗi:', error);
                        message.error('Xảy ra lỗi khi cập nhật!');
                    }
                    return;
                }

                // Nếu không có form đang sử dụng, cập nhật trực tiếp
                await axios.put(`/question/storage/${selectedForm.id}`, payload, { headers });

                // Cập nhật thông tin người dùng trong SQL Server
                const userPayload = {
                    ...values,
                    brandName: updatedBrandNames,
                    chinhanh: updatedChinhanhs,
                    pick: true,
                    FormName: selectedForm.id
                };

                if (editUser) {
                    await axios.put(`/users/update/${editUser.keys}`, userPayload, { headers });
                } else {
                    await axios.post('/users/add', userPayload, { headers });
                }
            } else {
                // Nếu không có form được chọn (đã bị xóa), cập nhật lại form cũ
                if (editUser && editUser.FormName) {
                    const oldForm = forms.find(f => f.id === editUser.FormName);
                    if (oldForm) {
                        // Lấy danh sách form đang được sử dụng
                        const response = await axios.get('/question/storage/list', {
                            params: {
                                brandName: oldForm.brandName,
                            },
                            headers
                        });

                        if (response.data.success) {
                            // Tìm form cũ
                            const existingForm = response.data.forms.find(form =>
                                form.id === oldForm.id
                            );

                            if (existingForm) {
                                // Xóa chi nhánh đã chọn khỏi form cũ
                                const updatedChinhanh = Array.isArray(existingForm.chinhanh) 
                                    ? existingForm.chinhanh.filter(ch => ch !== editUser.ResCode)
                                    : [];

                                // Xóa thương hiệu hiện tại khỏi form cũ
                                const updatedBrandNames = Array.isArray(existingForm.brandName)
                                    ? existingForm.brandName.filter(brand => brand !== values.BrandName)
                                    : [];

                                // Cập nhật form cũ - chỉ xóa chi nhánh và thương hiệu đã chọn
                                await axios.put(`/question/storage/${oldForm.id}`, {
                                    id: oldForm.id,
                                    brandName: updatedBrandNames,
                                    chinhanh: updatedChinhanh,
                                    pick: false, // Set pick = false khi allowClear
                                    formName: existingForm.formName,
                                    steps: existingForm.steps
                                }, { headers });
                            }
                        }
                    }
                }

                // Cập nhật thông tin người dùng trong SQL Server
                const userPayload = {
                    ...values,
                    FormName: null,
                    brandName: null, // Xóa thương hiệu
                    chinhanh: null, // Xóa chi nhánh
                    pick: false // Set pick = false
                };

                if (editUser) {
                    await axios.put(`/users/update/${editUser.keys}`, userPayload, { headers });
                } else {
                    await axios.post('/users/add', userPayload, { headers });
                }
            }

            message.success(t('cauhoi.Thành công'));
            onClose();
            fetchData();
        } catch (error) {
            console.error('Lỗi:', error);
            message.error('Xảy ra lỗi khi thêm/cập nhật người dùng!');
        }
    };

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
                    brandNames.some(brand => form.brandName.includes(brand)) &&
                    chinhanhs.some(ch => form.chinhanh.includes(ch))
                );

                if (existingForms.length > 0) {
                    // Tạo thông báo chi tiết về các form đang sử dụng
                    const formDetails = existingForms.map(form => {
                        const commonBrands = form.brandName.filter(brand => brandNames.includes(brand));
                        const commonChinhanhs = form.chinhanh.filter(ch => chinhanhs.includes(ch));
                        return {
                            formName: form.formName,
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

    const deleteUser = async (keys) => {
        try {
            await axios.delete(`/users/delete/${keys}`, {
                headers: {
                    'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
                }
            });
            message.success(t('cauhoi.Thành công'));
            fetchData();
        } catch (error) {
            console.error('Error deleting user:', error);
            message.error(t('cauhoi.Xóa thất bại'));
        }
    };

    const showEditDrawer = (record) => {
        setEditUser(record);
        setVisible(true);
        form.setFieldsValue({
            Fullname: record.Fullname,
            Email: record.Email,
            Password: record.Password,
            BrandName: record.BrandName,
            PhanQuyen: record.PhanQuyen,
            ResCode: record.ResCode,
            selectedFormId: record.FormName
        });
    };

    const handleResCodeChange = (value) => {
        const selectedBranch = diadiem.find(branch => branch.TenChiNhanh === value);
        if (selectedBranch) {
            if (!selectedBranch.Brand) {
                notification.warning({
                    message: 'Warning',
                    description: t('cauhoi.Cảnh báo'),
                });
            }
            form.setFieldsValue({
                BrandName: selectedBranch.Brand,
            });
        }
    };

    const handleBrandChange = (value) => {
        const branches = diadiem.filter(item => item.Brand === value);
        setFilteredBranches(branches);
        form.setFieldsValue({
            ResCode: undefined
        });
    };

    const handleDownload = async () => {
        try {
            const response = await axios.get('/users/download', {
                headers: {
                    'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
                },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'users_export.json');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            message.success(t('Tải xuống thành công'));
        } catch (error) {
            console.error('Error downloading users:', error);
            message.error('Tải xuống thất bại');
        }
    };

    const handleUpload = async (file) => {
        if (!file.name.endsWith('.json')) {
            message.error(t('Chỉ chấp nhận file JSON'));
            return false;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            await axios.post('/users/upload', formData, {
                headers: {
                    'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`,
                    // Không cần thiết lập 'Content-Type' vì axios tự động xử lý multipart/form-data
                },
            });
            message.success(t('Tải lên thành công'));
            fetchData();
        } catch (error) {
            console.error('Error uploading users:', error);
            // Hiển thị thông báo lỗi chi tiết từ backend nếu có
            const errorMessage = error.response?.data?.message || 'Tải lên thất bại';
            message.error(t(errorMessage));
            return false;
        }
        return false; // Ngăn Ant Design tự động hiển thị file
    };

    const columns = [
        {
            title: t('cauhoi.Họ và tên'),
            dataIndex: 'Fullname',
            key: 'Fullname',
        },
        {
            title: t('cauhoi.Tài khoản Email'),
            dataIndex: 'Email',
            key: 'Email',
        },
        {
            title: t('cauhoi.Mật khẩu'),
            dataIndex: 'Password',
            key: 'Password',
        },
        {
            title: t('cauhoi.Thương hiệu'),
            dataIndex: 'BrandName',
            key: 'BrandName',
            render: (text, record) => {
                if (text === "RuNam D'or") {
                    return <img src={RunamDorLogo} alt="RuNam D'or Logo" style={{ height: 50 }} />;
                } else if (text === 'RuNam') {
                    return <img src={RunamLogo} alt="RuNam Logo" style={{ height: 50 }} />;
                } else if (text === 'Goody') {
                    return <img src={GoodyLogo} alt="Goody Logo" style={{ height: 50 }} />;
                } else if (text === 'Ciao Cafe') {
                    return <img src={CiaoLogo} alt="Ciao Cafe" style={{ height: 50 }} />;
                } else if (text === 'Nhà hàng Thanh Niên') {
                    return <img src={ThanhnienLogo} alt="Nhà hàng Thanh Niên" style={{ height: 50 }} />;
                } else if (text === 'Niso') {
                    return <img src={NisoLogo} alt="Niso Logo" style={{ height: 50 }} />;
                } else {
                    return text || <Tag color="red" bordered={false}>{t('cauhoi.Trống')}</Tag>;
                }
            },
        },
        {
            title: 'Restaurant',
            dataIndex: 'ResCode',
            key: 'ResCode',
        },
        {
            title: 'Form áp dụng',
            dataIndex: 'FormName',
            key: 'FormName',
            render: (text, record) => {
                const selectedForm = forms.find(f => f.id === record.FormName);
                if (selectedForm) {
                    return (
                        <span style={{
                            color: user.BrandName === 'Ciao Cafe' ? '#902b8a' :
                                user.BrandName === 'Goody' ? 'rgb(111, 112, 114)' :
                                    user.BrandName === 'Nhà hàng Thanh Niên' ? 'rgb(35, 32, 32)' : '#e0d4bb'
                        }}>
                            {selectedForm.formName.vi || selectedForm.formName.en || selectedForm.formName.kh}
                        </span>
                    );
                }
                return <Tag color="red" bordered={false}>{t('cauhoi.Trống')}</Tag>;
            }
        },
        {
            title: t('cauhoi.Phân quyền'),
            dataIndex: 'PhanQuyen',
            key: 'PhanQuyen',
            render: (phanQuyen) => (
                <Tag color={phanQuyen ? '#f50' : '#52c41a'} bordered={false}>
                    {phanQuyen ? 'Admin' : 'User'}
                </Tag>
            ),
        },
        {
            title: t('cauhoi.Tùy chọn'),
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="primary" onClick={() => showEditDrawer(record)} className={`${getClassName()}`}>
                        <p style={{ fontSize: '12px' }}>Edit</p>
                    </Button>
                    <Popconfirm
                        title={t('cauhoi.Bạn chắc chắn muốn xóa tài khoản này?')}
                        onConfirm={() => deleteUser(record.keys)}
                        overlayClassName={getPopup(record.BrandName)}
                        okText={<p style={{ fontSize: 12 }}>Xóa</p>}
                        cancelText={<p style={{ fontSize: 12 }}>Hủy</p>}
                        okButtonProps={{
                            className: `${getClassName()} static button-full-width`,
                            size: 'small',
                            style: { fontSize: '12px' }
                        }}
                        cancelButtonProps={{
                            className: `${getClassName()} static button-full-width`,
                            size: 'small',
                            style: { fontSize: '12px' }
                        }}
                    >
                        <Button type="primary" className={`${getClassName()}`}>
                            <p style={{ fontSize: '12px' }}>Delete</p>
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const navigate = useNavigate();
    const handleGoBack = () => {
        navigate(-1);
    };

    const uniqueBrands = Array.isArray(diadiem) ? Array.from(new Set(diadiem.map(item => item.Brand))).filter(Boolean) : [];

    const getClassName = () => {
        switch (user.BrandName) {
            case 'RuNam':
            case "RuNam D'or":
                return 'custom-search-button';
            case 'Goody':
                return 'custom-Goody-button';
            case 'Ciao Cafe':
                return 'custom-ciao-button';
            case 'Nhà hàng Thanh Niên':
                return 'custom-nhtn-button';
            case 'Niso':
                return 'custom-niso-button';
            default:
                return '';
        }
    };

    return (
        <Card style={{ position: 'relative', zIndex: 3, background: 'transparent', minHeight: '100vh' }}>
            <title>CSS NISO | {t('cauhoi.Quản lý tài khoản')}</title>
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
                                : '#ae8f3d',
                    marginBottom: 15
                }}>{t('cauhoi.Thêm tài khoản')}</h1>
            </span>
            <Input
                placeholder={t('cauhoi.Tìm kiếm Tài khoản')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                prefix={<SearchOutlined />}
                size="large"
                style={{ marginBottom: 20 }}
                className={`${getInput(user.BrandName)} custom__input2`}
            />
            <Space style={{ marginBottom: 20 }}>
                <Button className={`${getClassName()} padding__niso__menu`} size='small' type='primary' onClick={showDrawer}>
                    <p style={{ fontSize: '12px' }}>{t('cauhoi.Thêm tài khoản')}</p>
                </Button>
                <Button className={`${getClassName()} padding__niso__menu`} size='small' type='primary' onClick={handleDownload}>
                    <p style={{ fontSize: '12px' }}>{t('Download')}</p>
                </Button>
                <Upload
                    accept=".json"
                    showUploadList={false}
                    beforeUpload={handleUpload}
                >
                    <Button className={`${getClassName()} padding__niso__menu`} size='small' type='primary'>
                        <p style={{ fontSize: '12px' }}><UploadOutlined /> {t('Upload')}</p>
                    </Button>
                </Upload>
            </Space>
            <Table
                loading={loading}
                columns={columns}
                dataSource={filteredUsers.slice().reverse()}
                rowKey="keys"
                pagination={{ pageSize: 5, className: `${getPagination(user.BrandName)}` }}
                scroll={{ x: true }}
                className={`${getTableColor(user.BrandName)}`}
                style={{ width: '100%', whiteSpace: 'nowrap', background: 'transparent' }}
            />
            <Drawer
                title={<span className={getquestion2(user.BrandName)}>{editUser ? t('cauhoi.Chỉnh sửa tài khoản') : t('cauhoi.Tạo tài khoản')}</span>}
                width={600}
                onClose={onClose}
                visible={visible}
                footer={
                    <div style={{ textAlign: 'right' }}>
                        <Button className={`${getClassName()} static button-full-width`} size='large' type='primary' htmlType="submit" form="userForm">
                            <p style={{ fontSize: '12px' }}>{editUser ? t('cauhoi.Cập nhật') : t('cauhoi.Nút thêm mới')}</p>
                        </Button>
                    </div>
                }
                bodyStyle={{
                    background: `${getDraw(user.BrandName)}`,
                    paddingBottom: 80
                }}
                headerStyle={{
                    background: `${getDraw(user.BrandName)}`
                }}
                footerStyle={{
                    background: `${getDraw(user.BrandName)}`
                }}
            >
                <Form
                    form={form}
                    layout='vertical'
                    onFinish={onFinish}
                    id="userForm"
                    initialValues={{
                        PhanQuyen: editUser ? editUser.PhanQuyen : false,
                    }}
                >
                    <Form.Item
                        name="Fullname"
                        label={<span className={getquestion2(user.BrandName)}>{t('cauhoi.Họ và tên')}</span>}
                        rules={[{ required: true, message: t('cauhoi.Vui lòng nhập họ tên !') }]}
                    >
                        <Input autoComplete="off" className={`${getInput(user.BrandName)}`} placeholder={t('cauhoi.Vui lòng nhập họ tên !')} />
                    </Form.Item>
                    <Form.Item
                        name="Email"
                        label={<span className={getquestion2(user.BrandName)}>{t('cauhoi.Tài khoản Email')}</span>}
                        rules={[{ required: true, message: t('cauhoi.Vui lòng nhập địa chỉ Email !') }]}
                    >
                        <Input autoComplete="off" className={`${getInput(user.BrandName)}`} placeholder={t('cauhoi.Vui lòng nhập địa chỉ Email !')} />
                    </Form.Item>
                    <Form.Item
                        name="Password"
                        label={<span className={getquestion2(user.BrandName)}>{t('cauhoi.Mật khẩu')}</span>}
                        rules={[{ required: !editUser, message: t('cauhoi.Vui lòng nhập Mật khẩu !') }]}
                    >
                        <Input.Password autoComplete="off" className={`${getInput(user.BrandName)}`} placeholder={t('cauhoi.Vui lòng nhập Mật khẩu !')} />
                    </Form.Item>
                    <Form.Item
                        name="BrandName"
                        label={<span className={getquestion2(user.BrandName)}>{t('cauhoi.Chọn thương hiệu')}</span>}
                        rules={[{ required: true, message: t('cauhoi.Vui lòng chọn thương hiệu !') }]}
                    >
                        {uniqueBrands.length > 0 ? (
                            <Select
                                placeholder={t('cauhoi.Chọn thương hiệu...')}
                                showSearch
                                className={`${getSelect(user.BrandName)}`}
                                onChange={handleBrandChange}
                            >
                                {uniqueBrands.map((brand, index) => (
                                    <Select.Option value={brand} key={index}>
                                        <span style={{ display: 'flex', alignItems: 'center' }}>
                                            {brand === "RuNam D'or" && <img src={RunamDorLogo} alt="RuNam D'or Logo" style={{ width: 20, marginRight: 8 }} />}
                                            {brand === 'RuNam' && <img src={RunamLogo} alt="RuNam Logo" style={{ width: 20, marginRight: 8 }} />}
                                            {brand === 'Goody' && <img src={GoodyLogo} alt="Goody Logo" style={{ width: 20, marginRight: 8 }} />}
                                            {brand === 'Ciao Cafe' && <img src={CiaoLogo} alt="Ciao Cafe Logo" style={{ width: 20, marginRight: 8 }} />}
                                            {brand === 'Nhà hàng Thanh Niên' && <img src={ThanhnienLogo} alt="Nhà hàng Thanh Niên Logo" style={{ width: 20, marginRight: 8 }} />}
                                            {brand === 'Niso' && <img src={NisoLogo} alt="Niso Logo" style={{ width: 20, marginRight: 8 }} />}
                                            <span>{brand}</span>
                                        </span>
                                    </Select.Option>
                                ))}
                            </Select>
                        ) : (
                            <p>{t('cauhoi.Vui lòng vào cửa hàng thêm thương hiệu để tiếp tục.')}</p>
                        )}
                    </Form.Item>
                    <Form.Item
                        name="ResCode"
                        label={<span className={getquestion2(user.BrandName)}>Select restaurant branch</span>}
                        rules={[{ required: true, message: t('cauhoi.Vui lòng chọn nhà hàng !') }]}
                    >
                        <Select
                            placeholder={t('cauhoi.Select restaurant branch')}
                            showSearch
                            onChange={handleResCodeChange}
                            className={`${getSelect(user.BrandName)}`}
                            disabled={!form.getFieldValue('BrandName')}
                        >
                            {filteredBranches.map((item) => (
                                <Select.Option value={item.TenChiNhanh} key={item.id}>
                                    {item.TenChiNhanh}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label={<span className={getquestion2(user.BrandName)}>Chọn form áp dụng</span>}
                        name="selectedFormId"
                    >
                        <Select
                            placeholder='Chọn form áp dụng'
                            className={`${getSelect(user.BrandName)}`}
                            allowClear
                            showSearch
                        >
                            {forms.map(form => (
                                <Select.Option key={form.id} value={form.id}>
                                    {form.formName.vi || form.formName.en || form.formName.kh}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="PhanQuyen"
                        label={<span className={getquestion2(user.BrandName)}>{t('cauhoi.Phân quyền')}</span>}
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>
                </Form>
            </Drawer>
        </Card>
    );
};

export default React.memo(Admin);