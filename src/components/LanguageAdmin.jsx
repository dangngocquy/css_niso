import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Typography, Form, Button, message, Tabs, Card, Mentions, Input } from 'antd';
import { RollbackOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;
const { TabPane } = Tabs;

const LanguageAdmin = ({ user, t }) => {
    const [translations, setTranslations] = useState({
        vn: {},
        en: {},
        kh: {}
    });
    const [form] = Form.useForm();
    const [changedRows, setChangedRows] = useState({
        vn: {},
        en: {},
        kh: {}
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [brands] = useState([t('cauhoi.Hiển thị tên thương hiệu')]);

    useEffect(() => {
        fetchAllTranslations();
    }, []);

    const fetchAllTranslations = async () => {
        try {
            const headers = {
                'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
            };

            const [vnResponse, enResponse, khResponse] = await Promise.all([
                axios.get('/vn/all', { headers }),
                axios.get('/en/all', { headers }),
                axios.get('/kh/all', { headers })
            ]);
            setTranslations({
                vn: vnResponse.data,
                en: enResponse.data,
                kh: khResponse.data
            });
        } catch (error) {
            console.clear(error)
        }
    };

    const handleInputChange = (lang, key, value) => {
        const cleanedValue = value.replace(/@BrandName/g, 'BrandName');
        setChangedRows(prev => ({
            ...prev,
            [lang]: { ...prev[lang], [key]: cleanedValue }
        }));
    };

    const navigate = useNavigate();
    const handleGoBack = () => {
        navigate(-1);
    };

    const handleSaveRow = async (lang, key) => {
        try {
            const headers = {
                'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
            };

            const updatedCauhoi = { ...translations[lang].cauhoi, [key]: changedRows[lang][key] };
            const updatedTranslations = { ...translations[lang], cauhoi: updatedCauhoi };
            await axios.put(`/${lang}/update`,
                { translations: updatedTranslations },
                { headers }
            );
            setTranslations(prev => ({
                ...prev,
                [lang]: updatedTranslations
            }));
            message.success(`Saved successfully`);
            setChangedRows(prev => {
                const newChangedRows = { ...prev };
                delete newChangedRows[lang][key];
                return newChangedRows;
            });
        } catch (error) {
            console.clear(`Error updating ${lang} translation:`, error);
            message.error(`Failed to save row "${key}" in ${lang.toUpperCase()}`);
        }
    };

    const handleSaveAll = async (lang) => {
        try {
            const headers = {
                'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
            };

            const updatedCauhoi = { ...translations[lang].cauhoi, ...changedRows[lang] };
            const updatedTranslations = { ...translations[lang], cauhoi: updatedCauhoi };
            await axios.put(`/${lang}/update`,
                { translations: updatedTranslations },
                { headers }
            );
            setTranslations(prev => ({
                ...prev,
                [lang]: updatedTranslations
            }));
            message.success(`Saved successfully`);
            setChangedRows(prev => ({
                ...prev,
                [lang]: {}
            }));
        } catch (error) {
            console.clear(`Error updating all ${lang} translations:`, error);
            message.error(`Failed to save all changes in ${lang.toUpperCase()}`);
        }
    };

    const getInput = () => {
        if (user.BrandName === 'RuNam' || user.BrandName === "RuNam D'or") {
            return 'ant-input';
        } else if (user.BrandName === 'Goody') {
            return 'ant-input-goody';
        } else if (user.BrandName === 'Ciao Cafe') {
            return 'ant-input-ciao';
        } else {
            return '';
        }
    };

    const columns = (lang) => [
        {
            title: t('cauhoi.Mã cấu hình'),
            dataIndex: 'key',
            key: 'key',
            render: text => <Text className={`${getColorRate()}`}>{text}</Text>,
        },
        {
            title: t('cauhoi.Nội dung ngôn ngữ'),
            dataIndex: 'value',
            key: 'value',
            render: (text, record) => (
                <Form.Item
                    style={{ margin: 0 }}
                    name={[lang, record.key]}
                    initialValue={text}
                >
                    <Mentions
                        style={{ width: '100%' }}
                        onChange={(value) => handleInputChange(lang, record.key, value)}
                        defaultValue={text}
                        placeholder="Enter @ to mention brand"
                        prefix={['@']}
                        autoSize={{ maxRows: 4 }}
                        rows={2}
                    >
                        {brands.map((brand) => (
                            <Mentions.Option key={brand} value="BrandName">
                                {brand}
                            </Mentions.Option>
                        ))}
                    </Mentions>
                </Form.Item>
            ),
        },
        {
            title: t('cauhoi.Tùy chọn'),
            key: 'action',
            render: (_, record) => (
                <Button
                    onClick={() => handleSaveRow(lang, record.key)}
                    disabled={!changedRows[lang][record.key]}
                    className={`${getClassName()}`}
                >
                    <p>Save</p>
                </Button>
            ),
        },
    ];

    const getClassName = () => {
        if (user.BrandName === 'RuNam' || user.BrandName === "RuNam D'or") {
            return 'custom-search-button';
        } else if (user.BrandName === 'Goody') {
            return 'custom-Goody-button';
        } else if (user.BrandName === 'Ciao Cafe') {
            return 'custom-ciao-button';
        } else if (user.BrandName === 'Nhà hàng Thanh Niên') {
            return 'custom-nhtn-button';
        } else {
            return '';
        }
    };

    const getColorRate = () => {
        if (user.BrandName === 'RuNam' || user.BrandName === "RuNam D'or") {
            return 'qt4__runam';
        } else if (user.BrandName === 'Goody') {
            return 'qt4__goody';
        } else if (user.BrandName === 'Ciao Cafe') {
            return 'qt4__ciao';
        } else if (user.BrandName === 'Nhà hàng Thanh Niên') {
            return 'qt4__nhtn';
        } else {
            return '';
        }
    };

    const filterDataSource = (lang) => {
        return Object.entries(translations[lang].cauhoi || {})
            .filter(([key, value]) => key.toLowerCase().includes(searchTerm.toLowerCase()) || value.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(([key, value]) => ({
                key,
                value,
            }));
    };

    return (
        <Card style={{ position: 'relative', zIndex: 3, background: 'transparent', minHeight: '100vh' }}>
            <title>CSS NISO | {t('cauhoi.Nội dung trang quản lý ngôn ngữ')}</title>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <Button className={`${getClassName()} padding__niso__menu`} size='large' type='primary' onClick={handleGoBack}><p><RollbackOutlined style={{
                    color: user.BrandName === 'Ciao Cafe'
                        ? '#fff'
                        : user.BrandName === 'Goody'
                            ? 'rgb(241, 132, 174)'
                            : 'var(--color)',
                    fontSize: 18
                }} /></p></Button>
                <h1 style={{ textTransform: 'uppercase', color: 'var(--main-background)', marginBottom: 15 }}>{t('cauhoi.Nội dung trang quản lý ngôn ngữ')}</h1>
            </span>
            <Input
                style={{ width: '100%', marginBottom: 20 }}
                placeholder={t('cauhoi.Tìm theo nội dung hoặc mã cấu hình')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                prefix={<SearchOutlined />}
                className={`${getInput()} custom__input2`}
            />
            <Form form={form}>
                <Tabs defaultActiveKey="vn">
                    {['vn', 'en', 'kh'].map(lang => (
                        <TabPane tab={lang.toUpperCase()} key={lang}>
                            <Button
                                onClick={() => handleSaveAll(lang)}
                                disabled={Object.keys(changedRows[lang]).length === 0}
                                style={{ marginTop: 16 }}
                                className={`${getClassName()}`}
                            >
                                <p>{t('cauhoi.Nút lưu thay đổi')} ({lang.toUpperCase()})</p>
                            </Button>
                            <Table
                                dataSource={filterDataSource(lang)}
                                columns={columns(lang)}
                                rowKey="key"
                                pagination={{ pageSize: 5 }}
                                scroll={{ x: true }}
                                style={{ width: '100%', whiteSpace: 'nowrap', background: 'transparent' }} />
                        </TabPane>
                    ))}
                </Tabs>
            </Form>
        </Card>
    );
};

export default React.memo(LanguageAdmin);