import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Table, Card, Tag, Button, Input, Empty } from 'antd';
import axios from 'axios';
import GoodyLogo from '../asset/Goody.svg';
import RunamDorLogo from '../asset/RUNAMDOR.svg';
import RunamLogo from '../asset/RUNAM.svg';
import CiaoLogo from '../asset/Ciao.svg';
import ThanhnienLogo from '../asset/Thanh_nien.svg'
import { useNavigate } from 'react-router-dom';
import { RollbackOutlined, SearchOutlined } from '@ant-design/icons';
import { getInput, getTableColor } from './form/Custom';

const BRAND_LOGOS = {
    "RuNam D'or": { src: RunamDorLogo, alt: "RuNam D'or Logo" },
    "RuNam": { src: RunamLogo, alt: "RuNam Logo" },
    "Goody": { src: GoodyLogo, alt: "Goody Logo" },
    "Ciao Cafe": { src: CiaoLogo, alt: "Ciao Cafe" },
    "Nhà hàng Thanh Niên": { src: ThanhnienLogo, alt: "Nhà hàng Thanh Niên" }
};

const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const Static = ({ user, handleLogout, t }) => {
    const [tableState, setTableState] = useState({
        data: [],
        loading: true,
        searchValue: '',
        expandedRowKeys: [],
        nestedSearchValues: {},
        pagination: {
            current: 1,
            pageSize: 5,
            total: 0
        }
    });

    const navigate = useNavigate();
    const fetchData = useCallback(async (page = 1, search = '') => {
        try {
            setTableState(prev => ({ ...prev, loading: true }));
            const response = await axios.get(`/css/all?page=${page}&search=${search}`, {
                headers: {
                    'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
                }
            });
            
            if (!response.data?.data || response.data.data.length === 0) {
                setTableState(prev => ({
                    ...prev,
                    data: [],
                    loading: false,
                    pagination: {
                        current: 1,
                        pageSize: 5,
                        total: 0
                    }
                }));
                return;
            }

            setTableState(prev => ({
                ...prev,
                data: response.data.data,
                loading: false,
                pagination: {
                    current: response.data.current,
                    pageSize: response.data.pageSize,
                    total: response.data.total
                }
            }));
        } catch (error) {
            console.error('Error fetching data:', error);
            setTableState(prev => ({ 
                ...prev, 
                data: [],
                loading: false,
                pagination: {
                    current: 1,
                    pageSize: 5,
                    total: 0
                }
            }));
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getBrandLogo = useCallback((brandName) => BRAND_LOGOS[brandName], []);

    const columns = useMemo(() => [
        {
            title: t('cauhoi.Họ và tên'),
            dataIndex: 'Fullname',
            key: 'Fullname',
            render: text => text || <Tag color="red">{t('cauhoi.Trống')}</Tag>,
        },
        {
            title: t('cauhoi.Thương hiệu'),
            dataIndex: 'BrandName',
            key: 'BrandName',
            render: (text) => {
                const logo = getBrandLogo(text);
                return logo ?
                    <img src={logo.src} alt={logo.alt} style={{ height: 50 }} /> :
                    text || <Tag color="red">{t('cauhoi.Trống')}</Tag>;
            },
        },
        {
            title: t('cauhoi.Cửa hàng'),
            dataIndex: 'ResCode',
            key: 'ResCode',
            render: text => text || <Tag color="red">{t('cauhoi.Trống')}</Tag>,
        },
        {
            title: t('cauhoi.Thời gian phản hồi'),
            dataIndex: 'Date',
            key: 'Date',
            render: text => text || <Tag color="red">{t('cauhoi.Trống')}</Tag>,
        },
    ], [t, getBrandLogo]);

    const debouncedSearch = useMemo(
        () => debounce((value) => {
            setTableState(prev => ({ 
                ...prev, 
                searchValue: value.toLowerCase(),
                pagination: { ...prev.pagination, current: 1 }
            }));
            fetchData(1, value.toLowerCase());
        }, 500),
        [fetchData]
    );

    const handleSearch = useCallback((value) => {
        debouncedSearch(value);
    }, [debouncedSearch]);

    const handleNestedSearch = useCallback((value, record) => {
        setTableState(prev => ({
            ...prev,
            nestedSearchValues: { ...prev.nestedSearchValues, [record.keys]: value },
            expandedRowKeys: prev.expandedRowKeys.includes(record.keys)
                ? prev.expandedRowKeys
                : [...prev.expandedRowKeys, record.keys]
        }));
    }, []);

    const handleGoBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    const getClassName = useCallback(() => {
        const classNames = {
            'RuNam': 'custom-search-button',
            "RuNam D'or": 'custom-search-button',
            'Goody': 'custom-Goody-button',
            'Ciao Cafe': 'custom-ciao-button',
            'Nhà hàng Thanh Niên': 'custom-nhtn-button'
        };
        return classNames[user.BrandName] || '';
    }, [user.BrandName]);

    const expandedRowRender = useCallback((record) => {
        const nestedColumns = [
            {
                title: t('cauhoi.Các câu hỏi'),
                dataIndex: 'Question',
                key: 'Question',
                render: text => text || <Tag color="red">{t('cauhoi.Trống')}</Tag>,
            },
            {
                title: t('cauhoi.Nội dung câu trả lời'),
                dataIndex: 'Replly',
                key: 'Replly',
                render: text => text || <Tag color="red">{t('cauhoi.Trống')}</Tag>,
            },
        ];

        const searchValue = tableState.nestedSearchValues[record.keys] || '';
        const filteredItems = record.items.filter(item =>
            item.Question?.toLowerCase().includes(searchValue.toLowerCase()) ?? false
        );

        return (
            <>
                <h1 style={{ 
                  textTransform: 'uppercase', 
                  color: user.BrandName === 'Ciao Cafe'
                    ? 'rgb(111, 112, 114)'
                    : user.BrandName === 'Goody'
                      ? 'rgb(111, 112, 114)' 
                      : user.BrandName === 'Nhà hàng Thanh Niên'
                        ? 'rgb(35, 32, 32)'
                        : '#ae8f3d',
                  marginBottom: 0, 
                  marginTop: 0 
                }}>{t('cauhoi.Phản hồi từ người dùng')}</h1>
                <Input
                    placeholder={t('cauhoi.Tìm kiếm theo câu hỏi')}
                    onChange={(e) => handleNestedSearch(e.target.value, record)}
                    style={{ marginBottom: 20, marginTop: 15 }}
                    size='large'
                    className={getInput(user.BrandName)}
                    prefix={<SearchOutlined />}
                />
                <Table
                    columns={nestedColumns}
                    dataSource={filteredItems}
                    pagination={{ pageSize: 5 }}
                    className={getTableColor(user.BrandName)}
                    scroll={{ x: true }}
                    style={{ width: '100%', whiteSpace: 'nowrap' }}
                    rowKey={(item, index) => index}
                />
            </>
        );
    }, [t, tableState.nestedSearchValues, handleNestedSearch, user.BrandName]);

    const handleTableChange = useCallback((pagination) => {
        fetchData(pagination.current, tableState.searchValue);
    }, [fetchData, tableState.searchValue]);

    const onExpandedRowsChange = (expandedKeys) => {
        setTableState(prev => ({
            ...prev,
            expandedRowKeys: expandedKeys
        }));
    };

    return (
        <Card style={{ minHeight: '100vh', background: 'transparent' }}>
            <title>NISO CSS | {t('cauhoi.Nội dung trang thống kê')}</title>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <Button className={`${getClassName()} padding__niso__menu`} size='large' type='primary' onClick={handleGoBack}>
                    <p>
                        <RollbackOutlined style={{
                            color: user.BrandName === 'Ciao Cafe'
                                ? '#fff'
                                : user.BrandName === 'Goody'
                                    ? 'rgb(241, 132, 174)'
                                    : 'var(--color)',
                            fontSize: 18
                        }} />
                    </p>
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
                }}>{t('cauhoi.Nút thống kê')}</h1>
            </span>
            <Input
                placeholder={t('cauhoi.Thống kê')}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ marginBottom: 20 }}
                size='large'
                prefix={<SearchOutlined />}
                className={getInput(user.BrandName)}
            />

            <Table
                columns={columns}
                dataSource={tableState.data}
                className={getTableColor(user.BrandName)}
                loading={tableState.loading}
                expandable={{
                    expandedRowRender,
                    expandedRowKeys: tableState.expandedRowKeys,
                    onExpandedRowsChange: onExpandedRowsChange
                }}
                rowKey="keys"
                pagination={tableState.pagination}
                onChange={handleTableChange}
                scroll={{ x: true }}
                style={{ width: '100%', whiteSpace: 'nowrap' }}
                locale={{
                    emptyText: (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <span style={{ color: 'var(--main-background)' }}>
                                    {tableState.searchValue 
                                        ? t('Không tìm thấy kết quả phù hợp')
                                        : t('cauhoi.Không có dữ liệu')}
                                </span>
                            }
                        />
                    )
                }}
            />
        </Card>
    );
};

export default Static;