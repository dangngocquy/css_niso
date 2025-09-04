import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { message, Select } from 'antd';
import vi from '../asset/vn.svg';
import us from '../asset/us.svg';
import kh from '../asset/kh.svg';
import { getSelect } from './form/Custom';

const { Option } = Select;

const languages = [
    { code: 'vi', name: 'Tiếng việt', flag: vi },
    { code: 'en', name: 'English', flag: us }, 
    { code: 'kh', name: 'Cambodia', flag: kh },
];

const Language = React.memo(({ phanquyen, user }) => {
    const { t, i18n } = useTranslation();
    const [selectedLanguage, setSelectedLanguage] = useState(() => 
        localStorage.getItem('selectedLanguage') || 'vi'
    );

    useEffect(() => {
        if (!localStorage.getItem('selectedLanguage')) {
            setSelectedLanguage('vi');
            localStorage.setItem('selectedLanguage', 'vi');
            i18n.changeLanguage('vi');
        }
    }, [i18n]);

    const handleLanguageChange = useCallback(async (code) => {
        if (code === selectedLanguage) {
            message.warning(t('Department.input116'));
            return;
        }
        
        try {
            setSelectedLanguage(code);
            localStorage.setItem('selectedLanguage', code);
            await i18n.changeLanguage(code);
            window.dispatchEvent(new Event('languageChange'));
            
            message.success(t('cauhoi.Thông báo thay đổi ngôn ngữ'));
            
            window.location.reload();
        } catch (error) {
            console.error('Lỗi khi thay đổi ngôn ngữ:', error);
            message.error('Có lỗi xảy ra khi thay đổi ngôn ngữ');
        }
    }, [selectedLanguage, t, i18n]);

    const renderOption = useCallback((language) => (
        <Option key={language.code} value={language.code}>
            <img
                alt={t(language.name)}
                src={language.flag}
                style={{ width: 20, marginRight: 8 }}
            />
            {t(language.name)} 
        </Option>
    ), [t]);

    const cardStyle = useMemo(() => ({
        alignItems: 'center', 
        display: 'flex', 
        justifyContent: 'center',
        padding: '24px'
    }), []);

    return (
        <div style={cardStyle}>
            <Select
                value={selectedLanguage}
                style={{ width: 200 }}
                onChange={handleLanguageChange}
                className={user?.BrandName ? `${getSelect(user.BrandName)}` : 'custom__selectniso'}
                size='large'
            >
                {languages.map(renderOption)}
            </Select>
        </div>
    );
});

export default Language;
