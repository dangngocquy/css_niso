import React, { useState, useEffect } from 'react';
import { Button, Input, message, Space, Tabs } from 'antd';
import axios from 'axios';
import { getInput, getTabs } from './form/Custom';

const ThankYou = ({
    user,
    geth1,
    getClassName,
    exitCountdown,
    handleCancelExit,
    applyColors,
    colorsCiaoCafe,
    colorGoody,
    t,
    colornhtn,
    isEditing,
    setIsEditing,
    stopCountdown,
    startExitCountdown,
    initialThankYouText,
    initialContentText
}) => {
    const [thankYouText, setThankYouText] = useState({
        vi: initialThankYouText?.vi || '',
        en: initialThankYouText?.en || '',
        kh: initialThankYouText?.kh || ''
    });
    const [contentText, setContentText] = useState({
        vi: initialContentText?.vi || '',
        en: initialContentText?.en || '',
        kh: initialContentText?.kh || ''
    });
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('vi');
    const [currentLang, setCurrentLang] = useState(localStorage.getItem('selectedLanguage') || 'vi');

    useEffect(() => {
        const lang = localStorage.getItem('selectedLanguage') || 'vi';
        setCurrentLang(lang);
    }, []);

    useEffect(() => {
        setThankYouText({
            vi: initialThankYouText?.vi || '',
            en: initialThankYouText?.en || '',
            kh: initialThankYouText?.kh || ''
        });
        setContentText({
            vi: initialContentText?.vi || '',
            en: initialContentText?.en || '',
            kh: initialContentText?.kh || ''
        });
    }, [initialThankYouText, initialContentText]);

    useEffect(() => {
        let timer;
        if (!isEditing && exitCountdown > 0) {
            timer = setInterval(() => {
                startExitCountdown();
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [exitCountdown, isEditing, startExitCountdown]);

    const handleEdit = () => {
        setIsEditing(true);
        stopCountdown();
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/question/thankyou', {
                brandName: user.BrandName,
                thankYouText,
                contentText
            }, {
                headers: {
                    'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
                }
            });

            if (response.data.success) {
                message.success(t('cauhoi.Thành công'));
                setIsEditing(false);
                startExitCountdown();
            }
        } catch (error) {
            console.error('Lỗi khi lưu:', error);
            message.error('Lỗi khi lưu nội dung');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        handleCancelExit();
    };

    const items = [
        {
            key: 'vi',
            label: 'Tiếng Việt',
            children: (
                <>
                    <Input
                        className={getInput(user.BrandName) + ' css5'}
                        value={thankYouText.vi}
                        onChange={(e) => setThankYouText({...thankYouText, vi: e.target.value})}
                        style={{ width: '100%' }}
                        placeholder={t('cauhoi.Nhập lời cảm ơn')}
                    />
                    <Input.TextArea
                        className={getInput(user.BrandName)}
                        value={contentText.vi}
                        onChange={(e) => setContentText({...contentText, vi: e.target.value})}
                        style={{ width: '100%', marginTop: '10px' }}
                        rows={4}
                        placeholder={t('cauhoi.Nhập nội dung')}
                    />
                </>
            ),
        },
        {
            key: 'en',
            label: 'English',
            children: (
                <>
                    <Input
                        className={getInput(user.BrandName) + ' css5'}
                        value={thankYouText.en}
                        onChange={(e) => setThankYouText({...thankYouText, en: e.target.value})}
                        style={{ width: '100%' }}
                        placeholder={t('cauhoi.Nhập lời cảm ơn')}
                    />
                    <Input.TextArea
                        className={getInput(user.BrandName)}
                        value={contentText.en}
                        onChange={(e) => setContentText({...contentText, en: e.target.value})}
                        style={{ width: '100%', marginTop: '10px' }}
                        rows={4}
                        placeholder={t('cauhoi.Nhập nội dung')}
                    />
                </>
            ),
        },
        {
            key: 'kh',
            label: 'ខ្មែរ',
            children: (
                <>
                    <Input
                        className={getInput(user.BrandName) + ' css5'}
                        value={thankYouText.kh}
                        onChange={(e) => setThankYouText({...thankYouText, kh: e.target.value})}
                        style={{ width: '100%' }}
                        placeholder={t('cauhoi.Nhập lời cảm ơn')}
                    />
                    <Input.TextArea
                        className={getInput(user.BrandName)}
                        value={contentText.kh}
                        onChange={(e) => setContentText({...contentText, kh: e.target.value})}
                        style={{ width: '100%', marginTop: '10px' }}
                        rows={4}
                        placeholder={t('cauhoi.Nhập nội dung')}
                    />
                </>
            ),
        },
    ];

    // Lắng nghe sự kiện thay đổi ngôn ngữ
    useEffect(() => {
        const handleLanguageChange = () => {
            const lang = localStorage.getItem('selectedLanguage') || 'vi';
            setCurrentLang(lang);
        };

        window.addEventListener('languageChange', handleLanguageChange);
        return () => {
            window.removeEventListener('languageChange', handleLanguageChange);
        };
    }, []);

    return (
        <div className="thank-you-message">
            <h1 className={`${geth1(user.BrandName)} thank__you__niso`}>
                {isEditing && <div className='thankyou__title'>{t('cauhoi.Lời cảm ơn cho')} {user.BrandName}</div>}
                {!isEditing ? (
                    <div onClick={user.PhanQuyen ? handleEdit : undefined} style={{ cursor: user.PhanQuyen ? 'pointer' : 'default' }}>
                        {user.BrandName === 'Ciao Cafe' && applyColors(thankYouText[currentLang], colorsCiaoCafe)}
                        {user.BrandName === 'Goody' && applyColors(thankYouText[currentLang], colorGoody)}
                        {user.BrandName === 'Nhà hàng Thanh Niên' && applyColors(thankYouText[currentLang], colornhtn)}
                        {user.BrandName === 'Niso' && applyColors(thankYouText[currentLang], '#ae8f3d')}
                        {!['Ciao Cafe', 'Goody', 'Nhà hàng Thanh Niên', 'Niso'].includes(user.BrandName) && thankYouText[currentLang]}
                    </div>
                ) : (
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        items={items}
                        size='small'
                        style={{ width: '100%' }}
                        className={getTabs(user.BrandName)}
                    />
                )}
            </h1>

            {!isEditing && (
                <p className={`content__niso__editer`} onClick={user.PhanQuyen && !isEditing ? handleEdit : undefined} style={{ cursor: user.PhanQuyen && !isEditing ? 'pointer' : 'default', width: '100%' }}>
                    {user.BrandName === 'Ciao Cafe' && applyColors(contentText[currentLang], colorsCiaoCafe)}
                    {user.BrandName === 'Goody' && applyColors(contentText[currentLang], colorGoody)}
                    {user.BrandName === 'Nhà hàng Thanh Niên' && applyColors(contentText[currentLang], colornhtn)}
                    {user.BrandName === 'Niso' && applyColors(contentText[currentLang], '#ae8f3d')}
                    {!['Ciao Cafe', 'Goody', 'Nhà hàng Thanh Niên', 'Niso'].includes(user.BrandName) && contentText[currentLang]}
                </p>
            )}

            {isEditing && (
                <Space style={{ width: '100%', marginTop: '10px' }}>
                    <Button
                        type="primary"
                        size='small'
                        onClick={handleSave}
                        className={`${getClassName(user.BrandName)}`}
                        loading={loading}
                        disabled={loading}
                    >
                        <p style={{
                            fontSize: '12px',
                            color: user.BrandName === 'Ciao Cafe'
                                ? '#ffffff'
                                : user.BrandName === 'Goody'
                                    ? 'rgb(241, 132, 174)'
                                    : user.BrandName === 'Nhà hàng Thanh Niên'
                                        ? '#ffffff'
                                        : user.BrandName === 'Niso'
                                            ? '#ffffff'
                                            : '#e0d4bb'
                        }}>{t('cauhoi.Lưu')}</p>
                    </Button>
                    <Button
                        type="primary"
                        size='small'
                        onClick={handleCancel}
                        disabled={loading}
                        className={`${getClassName(user.BrandName)}`}
                    >
                        <p style={{
                            fontSize: '12px',
                            color: user.BrandName === 'Ciao Cafe'
                                ? '#ffffff'
                                : user.BrandName === 'Goody'
                                    ? 'rgb(241, 132, 174)'
                                    : user.BrandName === 'Nhà hàng Thanh Niên'
                                        ? '#ffffff'
                                        : user.BrandName === 'Niso'
                                            ? '#ffffff'
                                            : '#e0d4bb'
                        }}>{t('cauhoi.Hủy')}</p>
                    </Button>
                </Space>
            )}

            {!isEditing && (
                <Button
                    type='primary'
                    onClick={handleCancelExit}
                    className={`${getClassName(user.BrandName)}`}
                    style={{ width: '100%', textTransform: 'none', marginTop: 16 }}
                    size='large'
                >
                    <p style={{
                        fontSize: '18px',
                        color: user.BrandName === 'Goody' ? 'rgb(241, 132, 174)' : user.BrandName === 'Niso' ? '#ffffff' : 'inherit'
                    }}>
                        Exit ({exitCountdown})
                    </p>
                </Button>
            )}
        </div>
    );
};

export default ThankYou; 