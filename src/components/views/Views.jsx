import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Select, Empty, Card, message, DatePicker, Tag, Modal, Input, Spin } from 'antd';
import { EyeOutlined, RollbackOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import GoodyLogo from '../../asset/Goody.svg';
import RunamDorLogo from '../../asset/RUNAMDOR.svg';
import RunamLogo from '../../asset/RUNAM.svg';
import CiaoLogo from '../../asset/Ciao.svg';
import ThanhnienLogo from '../../asset/Thanh_nien.svg';
import NisoLogo from '../../asset/Logo.svg';
import { getTableColor, getSelect, getRanger, getInput, getPagination } from '../form/Custom';

const { Option } = Select;
const { RangePicker } = DatePicker;

const Views = ({ user, t }) => {
    const [views, setViews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterBrand, setFilterBrand] = useState('');
    const [filterResCode, setFilterResCode] = useState('');
    const [dateRange, setDateRange] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchText, setSearchText] = useState('');
    const [confirmedSearchText, setConfirmedSearchText] = useState('');
    const [pagination, setPagination] = useState({
        pageSize: 5,
        total: 0,
    });
    const [resCodes, setResCodes] = useState([]);
    const [loadingLogos, setLoadingLogos] = useState({
        "RuNam D'or": true,
        'RuNam': true,
        'Goody': true,
        'Ciao Cafe': true,
        'Nhà hàng Thanh Niên': true,
        'Niso': true
    });
    const navigate = useNavigate();

    const fetchResCodes = useCallback(async () => {
        try {
            const response = await axios.get('/chinhanh/all', {
                headers: {
                    'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`,
                    'User-Info': encodeURIComponent(JSON.stringify({
                        PhanQuyen: user.PhanQuyen,
                        ResCode: user.ResCode
                    }))
                }
            });
            if (response.data && Array.isArray(response.data.data)) {
                setResCodes(response.data.data);
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách ResCode:', error);
            message.error(t('cauhoi.Không thể tải danh sách nhà hàng'));
        }
    }, [t, user.PhanQuyen, user.ResCode]);

    useEffect(() => {
        fetchResCodes();
    }, [fetchResCodes]);

    const fetchViews = useCallback(async (page = 1, brandFilter = '', dateRangeFilter = [], search = '', resCodeFilter = '', limit = 5) => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: limit,
            };

            if (!user.PhanQuyen) {
                params.ResCode = user.ResCode;
            } else {
                if (brandFilter) params.brandName = brandFilter;
                if (resCodeFilter) params.ResCode = resCodeFilter;
            }

            if (search) params.search = search;

            if (dateRangeFilter.length === 2) {
                params.startDate = dateRangeFilter[0].format('YYYY-MM-DD');
                params.endDate = dateRangeFilter[1].format('YYYY-MM-DD');
            }

            const response = await axios.get('/views/all', {
                headers: {
                    'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`,
                    'User-Info': encodeURIComponent(JSON.stringify({
                        PhanQuyen: user.PhanQuyen,
                        ResCode: user.ResCode
                    }))
                },
                params,
            });

            if (response.data.success) {
                setViews(response.data.data);
                setPagination({
                    pageSize: response.data.pageSize,
                    total: response.data.total,
                });
            } else {
                message.error(t('cauhoi.Không thể tải danh sách views'));
                setViews([]);
                setPagination({ pageSize: 5, total: 0 });
                setCurrentPage(1);
            }
        } catch (error) {
            console.error('Lỗi khi tải views:', error);
            message.error(t('cauhoi.Có lỗi xảy ra khi tải dữ liệu'));
            setViews([]);
            setPagination({ pageSize: 5, total: 0 });
            setCurrentPage(1);
        } finally {
            setLoading(false);
        }
    }, [t, user.PhanQuyen, user.ResCode]);

    // Initial data load on component mount
    useEffect(() => {
        fetchViews(1, '', [], '', '', pagination.pageSize);
    }, [fetchViews, pagination.pageSize]);

    const handleSearch = useCallback(() => {
        setConfirmedSearchText(searchText);
        setCurrentPage(1);
        fetchViews(1, filterBrand, dateRange, searchText, filterResCode, pagination.pageSize);
    }, [fetchViews, filterBrand, dateRange, searchText, filterResCode, pagination.pageSize]);

    const handleSearchInput = useCallback((e) => {
        setSearchText(e.target.value);
    }, []);

    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    }, [handleSearch]);

    const handleBrandFilter = useCallback((value) => {
        setFilterBrand(value);
        setCurrentPage(1);
        fetchViews(1, value, dateRange, confirmedSearchText, filterResCode, pagination.pageSize);
    }, [fetchViews, dateRange, confirmedSearchText, filterResCode, pagination.pageSize]);

    const handleDateRangeChange = useCallback((dates) => {
        setDateRange(dates || []);
        setCurrentPage(1);
        fetchViews(1, filterBrand, dates || [], confirmedSearchText, filterResCode, pagination.pageSize);
    }, [fetchViews, filterBrand, confirmedSearchText, filterResCode, pagination.pageSize]);

    const handleTableChange = useCallback((newPagination) => {
        const newPage = newPagination.current;
        setCurrentPage(newPage);
        fetchViews(newPage, filterBrand, dateRange, confirmedSearchText, filterResCode, newPagination.pageSize);
    }, [fetchViews, filterBrand, dateRange, confirmedSearchText, filterResCode]);

    const handlePageSizeChange = useCallback((current, size) => {
        setCurrentPage(1); // Reset to first page when page size changes
        setPagination(prev => ({ ...prev, pageSize: size }));
        fetchViews(1, filterBrand, dateRange, confirmedSearchText, filterResCode, size);
    }, [fetchViews, filterBrand, dateRange, confirmedSearchText, filterResCode]);

    const getClassName = useCallback(() => {
        const classNames = {
            'RuNam': 'custom-search-button',
            "RuNam D'or": 'custom-search-button',
            'Goody': 'custom-Goody-button',
            'Ciao Cafe': 'custom-ciao-button',
            'Nhà hàng Thanh Niên': 'custom-nhtn-button',
            'Niso': 'custom-niso-button'
        };
        return classNames[user.BrandName] || '';
    }, [user.BrandName]);

    const handleDelete = useCallback(async (id) => {
        try {
            const response = await axios.delete(`/views/${id}`, {
                headers: {
                    'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`,
                    'User-Info': encodeURIComponent(JSON.stringify({
                        PhanQuyen: user.PhanQuyen,
                        ResCode: user.ResCode
                    }))
                }
            });

            if (response.data.success) {
                message.success(t('cauhoi.Xóa thành công'));
                fetchViews(currentPage, filterBrand, dateRange, confirmedSearchText, filterResCode, pagination.pageSize);
            } else {
                message.error(response.data.message || t('cauhoi.Không thể xóa view'));
            }
        } catch (error) {
            console.error('Lỗi khi xóa view:', error);
            message.error(t('cauhoi.Có lỗi xảy ra khi xóa view'));
        }
    }, [t, user.PhanQuyen, user.ResCode, currentPage, filterBrand, dateRange, confirmedSearchText, filterResCode, fetchViews, pagination.pageSize]);

    const showDeleteConfirm = useCallback((id) => {
        Modal.confirm({
            title: t('cauhoi.Xác nhận xóa'),
            content: t('cauhoi.Bạn có chắc chắn muốn xóa view này?'),
            okText: t('cauhoi.Xóa'),
            okType: 'danger',
            cancelText: t('cauhoi.Hủy'),
            onOk: () => handleDelete(id),
        });
    }, [handleDelete, t]);

    const handleResCodeFilter = useCallback((value) => {
        console.log('Selected ResCode:', value);
        setFilterResCode(value);
        setCurrentPage(1);
        fetchViews(1, filterBrand, dateRange, confirmedSearchText, value, pagination.pageSize);
    }, [fetchViews, filterBrand, dateRange, confirmedSearchText, pagination.pageSize]);

    const handleLogoLoad = useCallback((brandName) => {
        setLoadingLogos(prev => ({
            ...prev,
            [brandName]: false
        }));
    }, []);

    const handleLogoError = useCallback((brandName) => {
        setLoadingLogos(prev => ({
            ...prev,
            [brandName]: false
        }));
    }, []);

    const columns = [
        {
            title: t('cauhoi.STT'),
            key: 'stt',
            width: 80,
            render: (_, __, index) => (currentPage - 1) * pagination.pageSize + index + 1,
        },
        {
            title: t('cauhoi.Ngày đánh giá'),
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (createdAt) => new Date(createdAt).toLocaleString(),
        },
        {
            title: t('cauhoi.Nhà hàng'),
            dataIndex: 'ResCode',
            key: 'ResCode',
        },
        {
            title: t('cauhoi.Brand Name'),
            dataIndex: 'brandName',
            key: 'brandName',
            render: (text, record) => {
                if (text === "RuNam D'or") {
                    return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Spin spinning={loadingLogos["RuNam D'or"]} size='small' />
                            <img
                                src={RunamDorLogo}
                                alt="RuNam D'or Logo"
                                style={{ height: 50 }}
                                onLoad={() => handleLogoLoad("RuNam D'or")}
                                onError={() => handleLogoError("RuNam D'or")}
                            />
                        </div>
                    );
                } else if (text === 'RuNam') {
                    return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Spin spinning={loadingLogos['RuNam']} size='small' />
                            <img
                                src={RunamLogo}
                                alt="RuNam Logo"
                                style={{ height: 50 }}
                                onLoad={() => handleLogoLoad('RuNam')}
                                onError={() => handleLogoError('RuNam')}
                            />
                        </div>
                    );
                } else if (text === 'Goody') {
                    return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Spin spinning={loadingLogos['Goody']} size='small' />
                            <img
                                src={GoodyLogo}
                                alt="Goody Logo"
                                style={{ height: 50 }}
                                onLoad={() => handleLogoLoad('Goody')}
                                onError={() => handleLogoError('Goody')}
                            />
                        </div>
                    );
                } else if (text === 'Ciao Cafe') {
                    return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Spin spinning={loadingLogos['Ciao Cafe']} size='small' />
                            <img
                                src={CiaoLogo}
                                alt="Ciao Cafe"
                                style={{ height: 50 }}
                                onLoad={() => handleLogoLoad('Ciao Cafe')}
                                onError={() => handleLogoError('Ciao Cafe')}
                            />
                        </div>
                    );
                } else if (text === 'Nhà hàng Thanh Niên') {
                    return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Spin spinning={loadingLogos['Nhà hàng Thanh Niên']} size='small' />
                            <img
                                src={ThanhnienLogo}
                                alt="Nhà hàng Thanh Niên"
                                style={{ height: 50 }}
                                onLoad={() => handleLogoLoad('Nhà hàng Thanh Niên')}
                                onError={() => handleLogoError('Nhà hàng Thanh Niên')}
                            />
                        </div>
                    );
                } else if (text === 'Niso') {
                    return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Spin spinning={loadingLogos['Niso']} size='small' />
                            <img
                                src={NisoLogo}
                                alt="Niso Logo"
                                style={{ height: 50 }}
                                onLoad={() => handleLogoLoad('Niso')}
                                onError={() => handleLogoError('Niso')}
                            />
                        </div>
                    );
                } else {
                    return text || <Tag color="red" bordered={false}>{t('cauhoi.Trống')}</Tag>;
                }
            },
        },
        {
            title: t('cauhoi.Tools'),
            key: 'tools',
            render: (_, record) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                        type="primary"
                        href={`/view/restaurant/${record.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        icon={<EyeOutlined />}
                        className={getClassName()}
                    >
                        <p style={{ fontSize: '11px' }}>{t('cauhoi.View')}</p>
                    </Button>
                    {user.PhanQuyen && (
                        <Button
                            type="primary"
                            icon={<DeleteOutlined />}
                            className={getClassName()}
                            onClick={() => showDeleteConfirm(record.id)}
                        >
                            <p style={{ fontSize: '11px' }}>{t('cauhoi.Xóa')}</p>
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    const handleGoBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    return (
        <Card style={{ minHeight: '100vh', background: 'transparent' }}>
            <title>NISO | {t('cauhoi.Danh sách đánh giá')}</title>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <Button
                    className={`${getClassName()} padding__niso__menu`}
                    size="large"
                    type="primary"
                    onClick={handleGoBack}
                >
                    <p>
                        <RollbackOutlined
                            style={{
                                color:
                                    user.BrandName === 'Ciao Cafe'
                                        ? '#fff'
                                        : user.BrandName === 'Goody'
                                            ? 'rgb(241, 132, 174)'
                                            : 'var(--color)',
                                fontSize: 18,
                            }}
                        />
                    </p>
                </Button>
                <h1
                    style={{
                        textTransform: 'uppercase',
                        color:
                            user.BrandName === 'Ciao Cafe'
                                ? 'rgb(111, 112, 114)'
                                : user.BrandName === 'Goody'
                                    ? 'rgb(111, 112, 114)'
                                    : user.BrandName === 'Nhà hàng Thanh Niên'
                                        ? 'rgb(35, 32, 32)'
                                        : '#ae8f3d',
                        marginBottom: 15,
                    }}
                >
                    {t('cauhoi.Danh sách đánh giá')}
                </h1>
            </span>
            <div style={{ display: 'flex', gap: '10px', marginBottom: 20 }}>
                <Input
                    placeholder={t('cauhoi.Nhập các thông tin đánh giá để tìm kiếm')}
                    size="large"
                    style={{ flex: 1 }}
                    className={`${getInput(user.BrandName)} custom__input2`}
                    value={searchText}
                    onChange={handleSearchInput}
                    onKeyPress={handleKeyPress}
                />
                <Button
                    type="primary"
                    size="large"
                    className={getClassName()}
                    onClick={handleSearch}
                >
                    <p><SearchOutlined style={{ fontSize: '16px' }} /></p>
                </Button>
            </div>
            <div style={{ marginBottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {user.PhanQuyen && (
                    <>
                        <Select
                            placeholder={t('cauhoi.Lọc theo Brand Name')}
                            onChange={handleBrandFilter}
                            size="large"
                            allowClear
                            className={`${getSelect(user.BrandName)}`}
                            style={{ minWidth: 200 }}
                        >
                            <Option value="RuNam">RuNam</Option>
                            <Option value="RuNam D'or">RuNam D'or</Option>
                            <Option value="Goody">Goody</Option>
                            <Option value="Ciao Cafe">Ciao Cafe</Option>
                            <Option value="Nhà hàng Thanh Niên">Nhà hàng Thanh Niên</Option>
                            <Option value="Niso">Niso</Option>
                        </Select>
                        <Select
                            placeholder={t('cauhoi.Lọc theo Nhà hàng')}
                            onChange={handleResCodeFilter}
                            size="large"
                            allowClear
                            className={`${getSelect(user.BrandName)}`}
                            style={{ minWidth: 200 }}
                            showSearch
                        >
                            {resCodes.map((res) => (
                                <Option key={`resCode-${res.id}`} value={res.TenChiNhanh}>
                                    {res.TenChiNhanh}
                                </Option>
                            ))}
                        </Select>
                    </>
                )}
                <RangePicker
                    onChange={handleDateRangeChange}
                    format="YYYY-MM-DD"
                    className={`${getRanger(user.BrandName)}`}
                    dropdownClassName={`${getRanger(user.BrandName)}`}
                    size="large"
                    style={{ minWidth: 300 }}
                />
            </div>
            <Table
                columns={columns}
                dataSource={views}
                rowKey="id"
                style={{ width: '100%', whiteSpace: 'nowrap', background: 'transparent' }}
                scroll={{ x: true }}
                loading={loading}
                className={`${getTableColor(user.BrandName)} css2`}
                pagination={{
                    current: currentPage,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    onChange: (page, pageSize) => handleTableChange({ current: page, pageSize: pageSize }),
                    showTotal: (total) => `${t('cauhoi.Tổng số')} ${total} ${t('cauhoi.đánh giá')}`,
                    showSizeChanger: true,
                    onShowSizeChange: handlePageSizeChange,
                    pageSizeOptions: ['5', '10', '20', '50'],
                    className: `${getPagination(user.BrandName)}`
                }}
                locale={{
                    emptyText: (
                        <Empty
                            description={
                                <span>
                                    {filterBrand || dateRange.length || confirmedSearchText
                                        ? t('cauhoi.Không tìm thấy kết quả phù hợp')
                                        : t('cauhoi.Không có dữ liệu')}
                                </span>
                            }
                        />
                    ),
                }}
            />
        </Card>
    );
};

export default Views;