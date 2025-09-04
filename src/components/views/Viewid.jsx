import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Rate, Input, Radio, Button, Row, Col, message, Layout, Space, Modal, Progress } from 'antd';
import { CloseCircleOutlined, InfoCircleOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import axios from 'axios';
import { getRate, getInput, getCheckbox, getColorRate, getquestion, getLogo, getClassName, geth1, geth2, getModal } from '../form/Custom';
import LogoLoad from '../LoadLogo';
import Language from '../Language';
import NisoFooter from '../../asset/ALL.png';

const { Content } = Layout;

const Viewid = ({ user, t }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [view, setView] = useState(null);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [currentLang, setCurrentLang] = useState(localStorage.getItem('selectedLanguage') || 'vi');
    const [currentStep, setCurrentStep] = useState(1);
    const [totalSteps, setTotalSteps] = useState(1);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [brandName, setBrandName] = useState(null);
    const [isDataReady, setIsDataReady] = useState(false);
    const [logoLoaded, setLogoLoaded] = useState(false);
    const logo = brandName ? getLogo(brandName) : null;

    useEffect(() => {
        const handleLanguageChange = () => {
            const newLang = localStorage.getItem('selectedLanguage') || 'vi';
            setCurrentLang(newLang);
        };

        window.addEventListener('storage', handleLanguageChange);
        return () => window.removeEventListener('storage', handleLanguageChange);
    }, []);

    useEffect(() => {
        const fetchView = async () => {
            setLoadingProgress(0);
            try {
                const progressInterval = setInterval(() => {
                    setLoadingProgress(prev => {
                        if (prev >= 99) {
                            clearInterval(progressInterval);
                            return 99;
                        }
                        return prev + 1;
                    });
                }, 30);

                const response = await axios.get(`/views/${id}`, {
                    headers: {
                        'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
                    }
                });
                if (response.data.success) {
                    const viewData = response.data.data;
                    console.log('View Data:', viewData);
                    console.log('ResCode:', viewData.ResCode);
                    setView(viewData);
                    setBrandName(viewData.brandName);

                    const maxStep = viewData.items && viewData.items.length > 0
                        ? Math.max(...viewData.items.map(item => item.step || 1))
                        : 1;
                    setTotalSteps(maxStep);
                } else {
                    message.error(t('cauhoi.Không thể tải chi tiết view'));
                }

                clearInterval(progressInterval);
                setLoadingProgress(100);
                setTimeout(() => {
                    setIsDataReady(true);
                }, 200);
            } catch (error) {
                console.error('Lỗi khi tải view:', error);
                message.error(t('cauhoi.Có lỗi xảy ra khi tải dữ liệu'));
            }
        };

        fetchView();
    }, [id, t]);

    useEffect(() => {
        if (logo) {
            setLogoLoaded(false);
            const img = new Image();
            img.src = logo;

            const loadTimeout = setTimeout(() => {
                setLogoLoaded(true);
            }, 5000);

            img.onload = () => {
                clearTimeout(loadTimeout);
                setLogoLoaded(true);
            };

            img.onerror = () => {
                clearTimeout(loadTimeout);
                console.error('Lỗi khi tải logo:', logo);
                setLogoLoaded(true);
            };
        } else {
            setLogoLoaded(true);
        }
    }, [logo]);

    const getLocalizedText = (text) => {
        if (!text) return '';
        if (typeof text === 'object') {
            return text[currentLang] || text.vi || '';
        }
        return text;
    };

    // Define handleNext and handlePrevious
    const handleNext = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const renderItem = (item, index) => {
        if (item.step !== currentStep && item.step !== undefined) {
            return null;
        }

        const questionType = item.type;

        return (
            <div key={index} style={{ marginBottom: 24 }}>
                {questionType === 'rate' && (
                    <div>
                        <p className={user?.PhanQuyen ? 'admin_bold_niso la' : 'bold'}>
                            <b className={`${getquestion(brandName)} content__niso__editer bold`}>
                                <span className={getquestion(brandName)}>
                                    <span style={{
                                        color: brandName === 'Ciao Cafe'
                                            ? 'rgb(245, 171, 33)'
                                            : brandName === 'Goody'
                                                ? 'rgb(111, 112, 114)'
                                                : brandName === 'Nhà hàng Thanh Niên'
                                                    ? 'rgb(35, 32, 32)'
                                                    : brandName === 'Niso'
                                                        ? '#ae8f3d'
                                                        : '#ae8f3d'
                                    }}>
                                        {item.required && <span style={{ color: 'red', fontSize: 18, marginRight: 8 }}>*</span>}
                                        {getLocalizedText(item.question)}
                                    </span>
                                </span>
                            </b>
                            {item.content && (
                                <div>
                                    <i className={`${getquestion(brandName)} content__niso__editer`} style={{
                                        color: brandName === 'Ciao Cafe'
                                            ? 'rgb(245, 171, 33)'
                                            : brandName === 'Goody'
                                                ? 'rgb(111, 112, 114)'
                                                : brandName === 'Nhà hàng Thanh Niên'
                                                    ? 'rgb(35, 32, 32)'
                                                    : brandName === 'Niso'
                                                        ? '#ae8f3d'
                                                        : '#ae8f3d'
                                    }}>
                                        {getLocalizedText(item.content)}
                                    </i>
                                </div>
                            )}
                        </p>
                        <Row gutter={[24, 24]} justify="start" style={{ marginTop: 12 }}>
                            {item.options?.map((option, idx) => (
                                <Col key={idx} xs={24} sm={12} md={6} style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                    <span className={user?.PhanQuyen ? 'good__text_niso' : 'text'} style={{ width: '100%', maxWidth: '280px' }}>
                                        <b className={`${getColorRate(brandName)} content__niso__editer`}>
                                            {getLocalizedText(option.title || option.question)}
                                        </b>
                                        <p className="lo">
                                            {option.content && (
                                                <b className={`${getColorRate(brandName)} content__niso__editer italic`}>
                                                    {getLocalizedText(option.content)}
                                                </b>
                                            )}
                                        </p>
                                        <Rate
                                            disabled
                                            value={Array.isArray(item.dapan) ? item.dapan[idx] : item.dapan}
                                            className={`${getRate(brandName)}`}
                                        />
                                    </span>
                                </Col>
                            ))}
                        </Row>
                    </div>
                )}

                {(questionType === 'text' || questionType === 'textarea') && (
                    <div>
                        <b className={`content__niso__editer`} style={{
                            color: brandName === 'Ciao Cafe'
                                ? 'rgb(245, 171, 33)'
                                : brandName === 'Goody'
                                    ? 'rgb(111, 112, 114)'
                                    : brandName === 'Nhà hàng Thanh Niên'
                                        ? 'rgb(35, 32, 32)'
                                        : brandName === 'Niso'
                                            ? '#ae8f3d'
                                            : '#ae8f3d'
                        }}>
                            {item.required && <span style={{ color: 'red', fontSize: 18, marginRight: 8 }}>*</span>}
                            {getLocalizedText(item.question)}
                        </b>
                        {questionType === 'text' && (
                            <Input
                                className={getInput(brandName)}
                                size="large"
                                value={item.dapan}
                                readOnly
                            />
                        )}
                        {questionType === 'textarea' && (
                            <Input.TextArea
                                className={getInput(brandName)}
                                size="large"
                                value={item.dapan}
                                readOnly
                                rows={4}
                                style={{ minHeight: 120 }}
                            />
                        )}
                    </div>
                )}

                {questionType === 'choice' && (
                    <div>
                        <b className={`content__niso__editer`} style={{
                            color: brandName === 'Ciao Cafe'
                                ? 'rgb(245, 171, 33)'
                                : brandName === 'Goody'
                                    ? 'rgb(111, 112, 114)'
                                    : brandName === 'Nhà hàng Thanh Niên'
                                        ? 'rgb(35, 32, 32)'
                                        : brandName === 'Niso'
                                            ? '#ae8f3d'
                                            : '#ae8f3d'
                        }}>
                            {item.required && <span style={{ color: 'red', fontSize: 18, marginRight: 8 }}>*</span>}
                            {getLocalizedText(item.question)}
                        </b>
                        <p className='lav'>
                            {item.content && (
                                <i className={`content__niso__editer italic`} style={{
                                    color: brandName === 'Ciao Cafe'
                                        ? 'rgb(245, 171, 33)'
                                        : brandName === 'Goody'
                                            ? 'rgb(111, 112, 114)'
                                            : brandName === 'Nhà hàng Thanh Niên'
                                                ? 'rgb(35, 32, 32)'
                                                : brandName === 'Niso'
                                                    ? '#ae8f3d'
                                                    : '#ae8f3d'
                                }}>
                                    {getLocalizedText(item.content)}
                                </i>
                            )}
                        </p>
                        <Radio.Group
                            className={`${getCheckbox()} ${brandName === 'Niso' ? 'customRadioNiso' : ''}`}
                            value={item.dapan}
                            disabled
                            style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}
                        >
                            {item.options?.map((option, index) => {
                                const optionText = getLocalizedText(option.title || option);
                                return (
                                    <Radio
                                        key={index}
                                        value={optionText}
                                        style={{ margin: 0 }}
                                        className={`${getCheckbox()} ${getColorRate(brandName)} size__niso ${brandName === 'Ciao Cafe' || brandName === 'Goody'
                                            ? 'customRadioNisociao'
                                            : brandName === 'Nhà hàng Thanh Niên'
                                                ? 'customRadioNisonhtn'
                                                : brandName === 'RuNam' || brandName === "RuNam D'or"
                                                    ? 'customRadioNisorunam'
                                                    : brandName === 'Niso'
                                                        ? 'customRadioNiso'
                                                        : ''
                                            }`}
                                    >
                                        {optionText}
                                    </Radio>
                                );
                            })}
                        </Radio.Group>
                    </div>
                )}
            </div>
        );
    };

    const getBrandColor = (brandName) => {
        switch (brandName) {
            case "RuNam":
            case "RuNam D'or":
                return "#8a6a16";
            case "Goody":
                return "#797a7c";
            case "Ciao Cafe":
                return "#797a7c";
            case "Nhà hàng Thanh Niên":
                return "#232020";
            case "Niso":
                return "#ae8f3d";
            default:
                return "#ae8f3d";
        }
    };

    const getProgressClass = (brandName) => {
        switch (brandName) {
            case "RuNam":
            case "RuNam D'or":
                return "colorprogressRunam";
            case "Goody":
                return "colorprogressGoody";
            case "Ciao Cafe":
                return "colorprogressCiao";
            case "Nhà hàng Thanh Niên":
                return "colorprogressnhtn";
            case "NISO":
                return "colorprogressNiso";
            default:
                return "";
        }
    };

    if (!isDataReady || !logoLoaded) {
        return <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            height: '100vh',
            gap: '10px',
            position: 'absolute',
            zIndex: 1000,
            width: '100%',
            background: 'rgb(252, 244, 229)',
            transition: 'opacity 0.2s'
        }} className='lll'>
            <LogoLoad brandName={brandName} />
            <Progress
                percent={loadingProgress}
                status="active"
                className={`${getProgressClass(brandName)}`}
                strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                }}
                style={{
                    marginTop: 10,
                    maxWidth: '300px',
                    transition: 'all 0.3s ease'
                }}
            />
            <span style={{
                color: getBrandColor(brandName),
                transition: 'opacity 0.2s'
            }}>
                {brandName} Loading...
            </span>
        </div>;
    }

    if (!view) {
        return <div>{t('cauhoi.Không tìm thấy dữ liệu')}</div>;
    }

    return (
        <Content className="container-content">
            <Button
                type='primary'
                size="large"
                className={`${getClassName(brandName)} left__menu_admin__niso padding__niso__menu`}
                onClick={showModal}
            >
                <p>
                    <InfoCircleOutlined style={{
                        color: brandName === 'Ciao Cafe'
                            ? '#fff'
                            : brandName === 'Goody'
                                ? 'rgb(241, 132, 174)'
                                : 'var(--color)',
                        fontSize: 20
                    }} />
                </p>
            </Button>
            <Modal
                title={
                    <div style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: getBrandColor(brandName)
                    }}>
                        {t('cauhoi.Thông tin chi tiết')}
                    </div>
                }
                open={isModalVisible}
                closeIcon={null}
                className={`${getModal(brandName)}`}
                onCancel={handleCancel}
                footer={[
                    <Button
                        key="back"
                        onClick={handleCancel}
                        className={`${getClassName(brandName)} static button-full-width`}
                    >
                        <p style={{ fontSize: '14px' }}>{t('cauhoi.Đóng')}</p>
                    </Button>
                ]}
            >
                <div style={{
                    padding: '16px',
                    backgroundColor: 'transparents',
                    backdropFilter: 'blur(18px)',
                    borderRadius: '8px',
                    marginBottom: '16px'
                }}>
                    <div style={{ marginBottom: '12px' }}>
                        <p style={{ margin: 0 }}>
                            <strong style={{ color: getBrandColor(brandName) }}>{t('cauhoi.Mã đánh giá')}:</strong>
                            <span style={{ marginLeft: '8px' }}>{view?.ResCode || '-'}</span>
                        </p>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                        <p style={{ margin: 0 }}>
                            <strong style={{ color: getBrandColor(brandName) }}>{t('cauhoi.Đánh giá')}:</strong>
                            <span style={{ marginLeft: '8px' }}>
                                {view?.rating ? view.rating.toFixed(1) : '-'} {t('cauhoi.sao')}
                            </span>
                        </p>
                    </div>
                    <div>
                        <p style={{ margin: 0 }}>
                            <strong style={{ color: getBrandColor(brandName) }}>{t('cauhoi.Ngày tạo')}:</strong>
                            <span style={{ marginLeft: '8px' }}>
                                {view?.createdAt ? new Date(view.createdAt).toLocaleString() : '-'}
                            </span>
                        </p>
                    </div>
                </div>

                <Language />
            </Modal>
            <div className="sidebar">
                <Space direction='vertical' style={{ alignItems: 'center' }}>
                    <img
                        src={logo}
                        alt="Logo Brand"
                        className={brandName === 'Niso' ? 'img_niso' : 'img_logo'}
                        onClick={() => navigate('/home')}
                    />
                    <Space style={{ whiteSpace: 'nowrap', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }} direction='vertical'>
                        <Button
                            type="primary"
                            onClick={() => window.close()}
                            className={`${getClassName(brandName)} jjsad`}
                            style={{ marginTop: 16 }}
                            icon={<CloseCircleOutlined />}
                        >
                            <p style={{ fontSize: 12 }}>Close</p>
                        </Button>
                    </Space>
                </Space>
            </div>
            <div className="main-content">
                <div className="content">
                    <div className="form-container">
                        {/* Display TieuDe, Title, qt1, qt2 */}
                        {view.TieuDe && (
                            <div style={{ marginBottom: 24 }}>
                                <h1 className={`${geth1(brandName)}`} style={{
                                    color: brandName === 'Ciao Cafe'
                                        ? 'rgb(5, 164, 77)'
                                        : brandName === 'Goody'
                                            ? 'rgb(111, 112, 114)'
                                            : brandName === 'Nhà hàng Thanh Niên'
                                                ? 'rgb(35, 32, 32)'
                                                : brandName === 'Niso'
                                                    ? '#8a6a16'
                                                    : '#ae8f3d'
                                }}>
                                    {getLocalizedText(view.TieuDe)}
                                </h1>
                            </div>
                        )}
                        {view.Title && (
                            <div style={{ marginBottom: 24 }}>
                                <h2 className={`${geth2(brandName)}`} style={{
                                    color: brandName === 'Ciao Cafe'
                                        ? 'rgb(5, 164, 77)'
                                        : brandName === 'Goody'
                                            ? 'rgb(111, 112, 114)'
                                            : brandName === 'Nhà hàng Thanh Niên'
                                                ? 'rgb(35, 32, 32)'
                                                : brandName === 'Niso'
                                                    ? '#8a6a16'
                                                    : '#ae8f3d'
                                }}>
                                    {getLocalizedText(view.Title)}
                                </h2>
                            </div>
                        )}
                        <div className='bold bottom-reponsive-niso'>
                            {view.qt1 && (
                                <div style={{ marginBottom: 16 }}>
                                    <b className={`content__niso__editer`} style={{
                                        color: brandName === 'Ciao Cafe'
                                            ? 'rgb(5, 164, 77)'
                                            : brandName === 'Goody'
                                                ? 'rgb(111, 112, 114)'
                                                : brandName === 'Nhà hàng Thanh Niên'
                                                    ? 'rgb(35, 32, 32)'
                                                    : brandName === 'Niso'
                                                        ? '#8a6a16'
                                                        : '#ae8f3d'
                                    }}>
                                        {getLocalizedText(view.qt1)}
                                    </b>
                                </div>
                            )}
                            {view.qt2 && (
                                <div style={{ marginBottom: 16 }}>
                                    <i className={`content__niso__editer`} style={{
                                        color: brandName === 'Ciao Cafe'
                                            ? 'rgb(5, 164, 77)'
                                            : brandName === 'Goody'
                                                ? 'rgb(111, 112, 114)'
                                                : brandName === 'Nhà hàng Thanh Niên'
                                                    ? 'rgb(35, 32, 32)'
                                                    : brandName === 'Niso'
                                                        ? '#8a6a16'
                                                        : '#ae8f3d'
                                    }}>
                                        {getLocalizedText(view.qt2)}
                                    </i>
                                </div>
                            )}
                        </div>
                        {/* Existing questions rendering */}
                        {view.items && view.items.length > 0 ? (
                            <>
                                {view.items.map((item, index) => renderItem(item, index))}
                                {totalSteps > 1 && (
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginTop: 16,
                                        gap: '16px'
                                    }}>
                                        {currentStep > 1 && (
                                            <Button
                                                type="primary"
                                                icon={<LeftOutlined />}
                                                block
                                                size="large"
                                                className={getClassName(brandName)}
                                                onClick={handlePrevious}
                                                style={{ flex: 1 }}
                                            >
                                                <p style={{ fontSize: 12 }}>{t('cauhoi.Previous')}</p>
                                            </Button>
                                        )}
                                        {currentStep < totalSteps && (
                                            <Button
                                                type="primary"
                                                icon={<RightOutlined />}
                                                size="large"
                                                block
                                                className={getClassName(brandName)}
                                                onClick={handleNext}
                                                style={{ flex: 1 }}
                                            >
                                                <p style={{ fontSize: 12 }}>{t('cauhoi.Next')}</p>
                                            </Button>
                                        )}
                                    </div>
                                )}
                                {brandName === 'Niso' && <img src={NisoFooter} alt="Footer" className='Nisofooter' style={{ marginTop: 15 }} />}
                            </>
                        ) : (
                            <p>{t('cauhoi.Không có câu hỏi nào')}</p>
                        )}
                    </div>
                </div>
            </div>
        </Content>
    );
};

export default Viewid;