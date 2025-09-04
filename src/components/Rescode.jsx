import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Drawer, Form, Input, message, Popconfirm, Card, Select, Tag, Upload } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SearchOutlined, RollbackOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import GoodyLogo from '../asset/Goody.svg';
import RunamDorLogo from '../asset/RUNAMDOR.svg';
import RunamLogo from '../asset/RUNAM.svg';
import CiaoLogo from '../asset/Ciao.svg';
import ThanhnienLogo from '../asset/Thanh_nien.svg';
import NisoLogo from '../asset/Logo.svg';
import { getTableColor, getSelect, getquestion2, getDraw, getInput, getPopup, getClassName, getPagination } from './form/Custom';

const Rescode = ({ user, t }) => {
    const [data, setData] = useState([]);
    const { Option } = Select;
    const [tableLoading, setTableLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [downloadLoading, setDownloadLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [form] = Form.useForm();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [total, setTotal] = useState(0);

    const fetchChinhanh = useCallback(async (page, size) => {
        setTableLoading(true);
        try {
            const response = await axios.get(`/chinhanh/all?page=${page}&pageSize=${size}`, {
                headers: {
                    'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
                }
            });
            setData(response.data.data);
            setTotal(response.data.pagination.total);
        } catch (error) {
            message.error(t('cauhoi.Failed to fetch data'));
        } finally {
            setTableLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchChinhanh(currentPage, pageSize);
    }, [fetchChinhanh, currentPage, pageSize]);

    const showDrawer = (record = null) => {
        if (record) {
            form.setFieldsValue(record);
            setEditingRecord(record);
        } else {
            form.resetFields();
            setEditingRecord(null);
        }
        setDrawerVisible(true);
    };

    const handleDrawerClose = () => {
        setDrawerVisible(false);
        setEditingRecord(null);
        form.resetFields();
    };

    const onFinish = async (values) => {
        if (editingRecord) {
            const duplicate = data.some(item => item.Code === values.Code && item.id !== editingRecord.id);
            if (duplicate) {
                message.warning(t('cauhoi.Mã cửa hàng đã tồn tại trên hệ thống!'));
                return;
            }
            setSubmitLoading(true);
            try {
                await axios.put(`/chinhanh/update/${editingRecord.id}`, values, {
                    headers: {
                        'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
                    }
                });
                message.success(t('cauhoi.Cập nhật thành công!'));
                fetchChinhanh(currentPage, pageSize);
                handleDrawerClose();
            } catch (error) {
                message.error(t('cauhoi.Failed to update data'));
            } finally {
                setSubmitLoading(false);
            }
        } else {
            const duplicate = data.some(item => item.Code === values.Code);
            if (duplicate) {
                message.warning(t('cauhoi.Mã cửa hàng đã tồn tại trên hệ thống!'));
                return;
            }
            setSubmitLoading(true);
            try {
                await axios.post('/chinhanh/add', values, {
                    headers: {
                        'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
                    }
                });
                message.success(t('cauhoi.Thêm thành công!'));
                fetchChinhanh(currentPage, pageSize);
                handleDrawerClose();
            } catch (error) {
                message.error(t('cauhoi.Failed to save data'));
            } finally {
                setSubmitLoading(false);
            }
        }
    };

    const handleDelete = async (id) => {
        setDeleteLoading(true);
        try {
            await axios.delete(`/chinhanh/delete/${id}`, {
                headers: {
                    'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
                }
            });
            message.success(t('cauhoi.Xóa thành công!'));
            fetchChinhanh(currentPage, pageSize);
        } catch (error) {
            message.error(t('cauhoi.Failed to delete data'));
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchText(e.target.value);
    };

    const handleUpload = async ({ file }) => {
        setUploadLoading(true);
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const jsonData = JSON.parse(e.target.result);
                    if (!Array.isArray(jsonData)) {
                        message.error('Invalid file format. Please upload a valid JSON array.');
                        return;
                    }
                    await axios.post('/chinhanh/upload', { data: jsonData }, {
                        headers: {
                            'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
                        }
                    });
                    message.success('Upload successful!');
                    fetchChinhanh(currentPage, pageSize);
                } catch (error) {
                    message.error(t('Failed to parse or upload file'));
                } finally {
                    setUploadLoading(false);
                }
            };
            reader.readAsText(file);
        } catch (error) {
            message.error(t('Failed to upload file'));
            setUploadLoading(false);
        }
    };

    const handleDownload = async () => {
        setDownloadLoading(true);
        try {
            const response = await axios.get('/chinhanh/download', {
                headers: {
                    'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
                },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'restaurants.json');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            message.success('Download successful!');
        } catch (error) {
            message.error('Failed to download data');
        } finally {
            setDownloadLoading(false);
        }
    };

    const handleTableChange = (newPagination) => {
        setCurrentPage(newPagination.current);
        setPageSize(newPagination.pageSize);
    };

    const filteredData = data.filter(item =>
        item.Code.toLowerCase().includes(searchText.toLowerCase()) ||
        item.TenChiNhanh.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        {
            title: t('cauhoi.Tên cửa hàng'),
            dataIndex: 'TenChiNhanh',
            key: 'TenChiNhanh',
        },
        {
            title: t('cauhoi.Mã cửa hàng'),
            dataIndex: 'Code',
            key: 'Code',
        },
        {
            title: t('cauhoi.Thương hiệu'),
            dataIndex: 'Brand',
            key: 'logo',
            render: (brand) => {
                switch (brand) {
                    case 'RuNam':
                        return <img src={RunamLogo} alt="RuNam Logo" style={{ height: 50 }} />;
                    case "RuNam D'or":
                        return <img src={RunamDorLogo} alt="RuNam D'or Logo" style={{ height: 50 }} />;
                    case 'Goody':
                        return <img src={GoodyLogo} alt="Goody Logo" style={{ height: 50 }} />;
                    case 'Ciao Cafe':
                        return <img src={CiaoLogo} alt="Ciao Cafe Logo" style={{ height: 50 }} />;
                    case 'Nhà hàng Thanh Niên':
                        return <img src={ThanhnienLogo} alt="Nhà hàng Thanh Niên Logo" style={{ height: 50 }} />;
                    case 'Niso':
                        return <img src={NisoLogo} alt="Niso Logo" style={{ height: 50 }} />;
                    default:
                        return <Tag color='red'>Trống</Tag>;
                }
            },
        },
        {
            title: t('cauhoi.Tùy chọn'),
            key: 'actions',
            render: (text, record) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                        type="primary"
                        className={`${getClassName(user.BrandName)}`}
                        onClick={() => showDrawer(record)}
                    >
                        <p style={{ fontSize: '12px' }}>Edit</p>
                    </Button>
                    <Popconfirm
                        title={t('cauhoi.Bạn chắc chắn muốn xóa cửa hàng này khỏi danh sách?')}
                        onConfirm={() => handleDelete(record.id)}
                        overlayClassName={getPopup(user.BrandName)}
                        okText={<p style={{ fontSize: 12 }}>Xóa</p>}
                        cancelText={<p style={{ fontSize: 12 }}>Hủy</p>}
                        okButtonProps={{
                            className: `${getClassName(user.BrandName)} static button-full-width`,
                            size: 'small',
                            style: { fontSize: '12px' }
                        }}
                        cancelButtonProps={{
                            className: `${getClassName(user.BrandName)} static button-full-width`,
                            size: 'small',
                            style: { fontSize: '12px' }
                        }}
                    >
                        <Button
                            type="primary"
                            className={`${getClassName(user.BrandName)}`}
                            loading={deleteLoading}
                        >
                            <p style={{ fontSize: '12px' }}>Delete</p>
                        </Button>
                    </Popconfirm>
                </div>
            )
        }
    ];

    const navigate = useNavigate();
    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <Card style={{ position: 'relative', zIndex: 3, background: 'transparent', minHeight: '100vh' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }} >
                <Button className={`${getClassName(user.BrandName)} padding__niso__menu`} size='large' type='primary' onClick={handleGoBack}>
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
                    marginBottom: 20
                }}>{t('cauhoi.Quản lý danh sách cửa hàng')}</h1>
            </span>
            <title>NISO CSS | {t('cauhoi.Danh sách cửa hàng')}</title>
            <Input
                placeholder={t('cauhoi.Tìm kiếm cửa hàng')}
                onChange={handleSearch}
                prefix={<SearchOutlined />}
                size='large'
                className={`${getInput(user.BrandName)} custom__input2`}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 20, gap: 10, marginTop: 20 }}>
                <Button
                    type="primary"
                    onClick={() => showDrawer()}
                    className={`${getClassName(user.BrandName)}`}
                    size='small'
                >
                    <p style={{ fontSize: '12px' }}>{t('cauhoi.Thêm cửa hàng')}</p>
                </Button>
                <Upload
                    accept=".json"
                    showUploadList={false}
                    customRequest={handleUpload}
                >
                    <Button
                        type="primary"
                        className={`${getClassName(user.BrandName)}`}
                        size='small'
                        icon={<UploadOutlined />}
                        loading={uploadLoading}
                    >
                        <p style={{ fontSize: '12px' }}>Upload</p>
                    </Button>
                </Upload>
                <Button
                    type="primary"
                    className={`${getClassName(user.BrandName)}`}
                    size='small'
                    onClick={handleDownload}
                    icon={<DownloadOutlined />}
                    loading={downloadLoading}
                >
                    <p style={{ fontSize: '12px' }}>Download</p>
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
                loading={tableLoading}
                className={`${getTableColor(user.BrandName)}`}
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: total,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng số ${total} mục`,
                    className: `${getPagination(user.BrandName)}`
                }}
                onChange={handleTableChange}
                scroll={{ x: true }}
                style={{ width: '100%', whiteSpace: 'nowrap' }}
            />
            <Drawer
                title={<span className={`${getquestion2(user.BrandName)}`}>
                    {editingRecord ? t('cauhoi.Chỉnh sửa cửa hàng') : t('cauhoi.Thêm cửa hàng')}
                </span>}
                open={drawerVisible}
                onClose={handleDrawerClose}
                width={600}
                bodyStyle={{
                    background: `${getDraw(user.BrandName)}`,
                    paddingBottom: 80
                }}
                headerStyle={{
                    background: `${getDraw(user.BrandName)}`
                }}
                footer={
                    <div style={{ textAlign: 'right' }}>
                        <Button
                            className={`${getClassName(user.BrandName)} static button-full-width`}
                            size='small'
                            type='primary'
                            htmlType="submit"
                            form="rescodeForm"
                            loading={submitLoading}
                        >
                            <p>{editingRecord ? t('cauhoi.Cập nhật') : t('cauhoi.Nút thêm mới')}</p>
                        </Button>
                    </div>
                }
                footerStyle={{
                    background: `${getDraw(user.BrandName)}`
                }}
            >
                <Form form={form} layout="vertical" onFinish={onFinish} id="rescodeForm">
                    <Form.Item name="TenChiNhanh" label={<span className={`${getquestion2(user.BrandName)}`}>Name</span>} rules={[{ required: true, message: t('cauhoi.Vui lòng nhập tên cửa hàng !') }]}>
                        <Input className={`${getInput(user.BrandName)}`} placeholder={t('cauhoi.Nhập tên cửa hàng')} />
                    </Form.Item>
                    <Form.Item name="Code" label={<span className={`${getquestion2(user.BrandName)}`}>Code</span>} rules={[{ required: true, message: t('cauhoi.Vui lòng nhập mã cửa hàng !') }]}>
                        <Input className={`${getInput(user.BrandName)}`} placeholder={t('cauhoi.Nhập mã cửa hàng')} />
                    </Form.Item>
                    <Form.Item
                        name="Brand"
                        label={<span className={`${getquestion2(user.BrandName)}`}>{t('cauhoi.Chọn thương hiệu')}</span>}
                        rules={[{ required: true, message: t('cauhoi.Chọn thương hiệu') }]}
                    >
                        <Select placeholder={t('cauhoi.Chọn thương hiệu')} className={`${getSelect(user.BrandName)}`}>
                            <Option value="RuNam">
                                <span style={{ display: 'flex', alignItems: 'center' }}>
                                    <img src={RunamLogo} alt="RuNam Logo" style={{ width: 20, marginRight: 8 }} />
                                    <span>RUNAM</span>
                                </span>
                            </Option>
                            <Option value="RuNam D'or">
                                <span style={{ display: 'flex', alignItems: 'center' }}>
                                    <img src={RunamDorLogo} alt="RuNam D'or Logo" style={{ width: 20, marginRight: 8 }} />
                                    <span>RUNAM D'OR</span>
                                </span>
                            </Option>
                            <Option value="Goody">
                                <span style={{ display: 'flex', alignItems: 'center' }}>
                                    <img src={GoodyLogo} alt="Goody Logo" style={{ width: 20, marginRight: 8 }} />
                                    <span>GOODY</span>
                                </span>
                            </Option>
                            <Option value="Ciao Cafe">
                                <span style={{ display: 'flex', alignItems: 'center' }}>
                                    <img src={CiaoLogo} alt="Ciao Cafe Logo" style={{ width: 20, marginRight: 8 }} />
                                    <span>CIAO CAFE</span>
                                </span>
                            </Option>
                            <Option value="Nhà hàng Thanh Niên">
                                <span style={{ display: 'flex', alignItems: 'center' }}>
                                    <img src={ThanhnienLogo} alt="Nhà hàng Thanh Niên Logo" style={{ width: 20, marginRight: 8 }} />
                                    <span>NHÀ HÀNG THANH NIÊN</span>
                                </span>
                            </Option>
                            <Option value="Niso">
                                <span style={{ display: 'flex', alignItems: 'center' }}>
                                    <img src={NisoLogo} alt="Niso Logo" style={{ width: 20, marginRight: 8 }} />
                                    <span>CÔNG TY CỔ PHẦN NISO</span>
                                </span>
                            </Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Drawer>
        </Card>
    );
};

export default React.memo(Rescode);