import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Form, Button, message, Mentions, Tabs } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { geth2, getMetions, getTabs, getColorTabs } from './Custom';
const SecondForm = ({
  user,
  customQuestions,
  renderCustomQuestion,
  getInput,
  getClassName,
  submitting,
  geth1,
  getEditingState,
  handleEditingState,
  processText,
  index,
  translations,
  handleEditableChange,
  item,
  questions,
  currentStep,
  totalSteps,
  t,
  form,
  storageQuestions,
  onEditStorageForm
}) => {
  const canEditField = (fieldName) => {
    const validBrands = ['RuNam', "RuNam D'or", 'Goody', 'Ciao Cafe', 'Nhà hàng Thanh Niên', 'Niso'];
    const editableFields = ['TieuDe', 'Title', 'qt1', 'qt2'];

    if (!validBrands.includes(user.BrandName)) return false;
    return editableFields.includes(fieldName);
  };

  const getBrandData = (field) => {
    if (!item) return '';

    if (!item[field] || !Array.isArray(item[field])) {
      const initialData = [
        { brand: 'RuNam', [field]: { vi: '', en: '', kh: '' } },
        { brand: "RuNam D'or", [field]: { vi: '', en: '', kh: '' } },
        { brand: 'Goody', [field]: { vi: '', en: '', kh: '' } },
        { brand: 'Ciao Cafe', [field]: { vi: '', en: '', kh: '' } },
        { brand: 'Nhà hàng Thanh Niên', [field]: { vi: '', en: '', kh: '' } },
        { brand: 'Niso', [field]: { vi: '', en: '', kh: '' } }
      ];

      if (item[field]) {
        const brandIndex = initialData.findIndex(data => data.brand === user.BrandName);
        if (brandIndex !== -1) {
          if (typeof item[field] === 'string') {
            initialData[brandIndex][field] = {
              vi: item[field],
              en: item[field],
              kh: item[field]
            };
          } else {
            initialData[brandIndex][field] = item[field];
          }
        }
      }

      item[field] = initialData;
    }

    const brandData = item[field].find(data => data.brand === user.BrandName);
    const currentLang = localStorage.getItem('selectedLanguage') || 'vi';

    if (brandData) {
      if (typeof brandData[field] === 'string') {
        return brandData[field];
      }
      if (typeof brandData[field] === 'object') {
        return brandData[field][currentLang] || brandData[field].vi || '';
      }
    }

    return '';
  };

  const handleBrandDataChange = async (field, value, index) => {
    try {
      if (!item) {
        console.error('Item is undefined');
        throw new Error('Dữ liệu không hợp lệ');
      }

      const formattedValue = {
        vi: value.vi || '',
        en: value.en || '',
        kh: value.kh || ''
      };

      const newItem = { ...item };
      const brandDataIndex = newItem[field]?.findIndex(d => d.brand === user.BrandName);

      if (brandDataIndex !== -1) {
        newItem[field][brandDataIndex] = {
          ...newItem[field][brandDataIndex],
          [field]: formattedValue
        };
      } else {
        if (!Array.isArray(newItem[field])) {
          newItem[field] = [];
        }
        newItem[field].push({
          brand: user.BrandName,
          [field]: formattedValue
        });
      }

      const response = await handleEditableChange(field, formattedValue, newItem);

      if (response?.success) {
        message.success({
          content: t('cauhoi.Cập nhật thành công'),
          duration: 2,
          style: {
            marginTop: '20vh',
            fontSize: '14px'
          }
        });
      }

      handleEditingState(field, index, false);

    } catch (error) {
      console.error('Error in handleBrandDataChange:', error);
      message.error({
        content: error.message || 'Có lỗi xảy ra khi lưu',
        duration: 2,
        style: {
          marginTop: '20vh',
          fontSize: '14px'
        }
      });
      throw error;
    }
  };

  const getBrandStyle = (brandName, questionsBrand) => {
    switch (brandName) {
      case 'Ciao Cafe':
        return 'rgb(5, 164, 77)';
      case 'Goody':
        return 'rgb(111, 112, 114)';
      case 'Niso':
        return '#8a6a16';
      default:
        return brandName === questionsBrand ? 'rgb(35, 32, 32)' : '#e0d4bb';
    }
  };

  const EditableFieldWithActions = ({
    value,
    field,
    index,
    translationKey,
    style = {}
  }) => {
    const [isSaving, setIsSaving] = useState(false);

    const getInitialValues = useCallback(() => {
      if (!item || !field) return { vi: '', en: '', kh: '' };

      const brandData = item[field]?.find(data => data.brand === user.BrandName);
      if (!brandData) return { vi: '', en: '', kh: '' };

      const rawData = brandData[field] || '';
      return {
        vi: typeof rawData === 'object' ? (rawData.vi || '') : rawData,
        en: typeof rawData === 'object' ? (rawData.en || '') : rawData,
        kh: typeof rawData === 'object' ? (rawData.kh || '') : rawData
      };
    }, [field]);

    const [inputValues, setInputValues] = useState(getInitialValues);

    const isEditing = getEditingState(field, index);

    useEffect(() => {
      setInputValues(getInitialValues());
    }, [getInitialValues, value]);

    if (!isEditing) {
      return (
        <>
          {processText(value, translations, translationKey)}
          {(user.PhanQuyen && canEditField(field)) && (
            <Button
              type="text"
              icon={<EditOutlined style={{
                color: user.BrandName === 'Ciao Cafe'
                  ? 'rgb(245, 171, 33)'
                  : user.BrandName === 'Goody'
                    ? 'rgb(111, 112, 114)'
                    : user.BrandName === 'Nhà hàng Thanh Niên'
                      ? 'rgb(35, 32, 32)'
                      : user.BrandName === 'Niso'
                        ? '#8a6a16'
                        : '#e0d4bb'
              }} />}
              onClick={() => handleEditingState(field, index, true)}
            />
          )}
        </>
      );
    }

    return (
      <div style={{ width: '100%' }}>
        <Tabs className={`${getTabs(user.BrandName)} ${getColorTabs(user.BrandName)}`}
          defaultActiveKey="vi">
          <Tabs.TabPane tab={t('cauhoi.Tiếng Việt')} key="vi">
            <Mentions
              className={`${getInput(user.BrandName)} ${getMetions(user.BrandName)}`}
              style={style}
              value={inputValues.vi}
              onChange={(val) => setInputValues(prev => ({ ...prev, vi: val }))}
              autoSize={{ maxRows: 3, minRows: 1 }}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab={t('cauhoi.Tiếng Anh')} key="en">
            <Mentions
              className={`${getInput(user.BrandName)} ${getMetions(user.BrandName)}`}
              style={style}
              value={inputValues.en}
              onChange={(val) => setInputValues(prev => ({ ...prev, en: val }))}
              autoSize={{ maxRows: 3, minRows: 1 }}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab={t('cauhoi.Tiếng Campuchia')} key="kh">
            <Mentions
              className={`${getInput(user.BrandName)} ${getMetions(user.BrandName)}`}
              style={style}
              value={inputValues.kh}
              onChange={(val) => setInputValues(prev => ({ ...prev, kh: val }))}
              autoSize={{ maxRows: 3, minRows: 1 }}
            />
          </Tabs.TabPane>
        </Tabs>
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'flex-end' }}>
          <Button
            type="primary"
            size='small'
            loading={isSaving}
            className={`${getClassName(user.BrandName)}`}
            onClick={async () => {
              setIsSaving(true);
              try {
                await handleBrandDataChange(field, inputValues, index);
                handleEditingState(field, index, false);
              } catch (error) {
                console.error('Error saving data:', error);
              } finally {
                setIsSaving(false);
              }
            }}
          >
            <p style={{ fontSize: 12 }}>{t('cauhoi.Lưu')}</p>
          </Button>
          <Button
            type="primary"
            size='small'
            className={`${getClassName(user.BrandName)}`}
            onClick={() => {
              setInputValues(getInitialValues());
              handleEditingState(field, index, false);
            }}
          >
            <p style={{ fontSize: 12 }}>{t('cauhoi.Hủy')}</p>
          </Button>
        </div>
      </div>
    );
  };

  const filteredQuestions = useMemo(() => {
    const questions = [...customQuestions];
    if (storageQuestions && storageQuestions.length > 0) {
      questions.push(...storageQuestions);
    }
    return questions.filter(question =>
      question.BrandName === user.BrandName &&
      question.step === (currentStep || 1)
    );
  }, [customQuestions, storageQuestions, user.BrandName, currentStep]);

  const hasQuestions = useMemo(() => {
    return filteredQuestions?.length > 0;
  }, [filteredQuestions]);

  useEffect(() => {
    if (currentStep === 1) {
      form.resetFields();
    }
  }, [currentStep, form]);

  return (
    <>
      <h1 className={`${geth1(user.BrandName)}`}>
        <EditableFieldWithActions
          value={getBrandData('TieuDe')}
          field="TieuDe"
          index={index}
          translationKey="Tiêu đề"
          style={{
            marginTop: 10,
            color: 'var(--color)',
            fontSize: 18
          }}
        />
      </h1>
      <h2 className={`${geth2(user.BrandName)}`}>{getEditingState('Title', index) ? (
        <EditableFieldWithActions
          value={getBrandData('Title')}
          field="Title"
          index={index}
          translationKey="Tiêu đề phụ"
          style={{
            marginTop: 10,
            color: 'var(--color)',
            fontSize: 18
          }}
        />
      ) : (
        <h2 className={`${geth2(user.BrandName)}`}>
          {processText(getBrandData('Title'), translations, 'Tiêu đề phụ')}
          {user.PhanQuyen && canEditField('Title') && (
            <Button type="text" icon={<EditOutlined style={{
              color: user.BrandName === 'Ciao Cafe'
                ? 'rgb(245, 171, 33)'
                : user.BrandName === 'Goody'
                  ? 'rgb(111, 112, 114)'
                  : user.BrandName === 'Nhà hàng Thanh Niên'
                    ? 'rgb(35, 32, 32)'
                    : user.BrandName === 'Niso'
                      ? '#8a6a16'
                      : '#e0d4bb'
            }} />} onClick={() => handleEditingState('Title', index, true)} />
          )}
        </h2>
      )}</h2>
      <p className={user.PhanQuyen ? 'los la' : 'bold bottom-reponsive-niso'}>
        {getEditingState('qt1', index) ? (
          <EditableFieldWithActions
            value={getBrandData('qt1')}
            field="qt1"
            index={index}
            translationKey="Nội dung"
          />
        ) : (
          <b className={`content__niso__editer`} style={{
            color: user.BrandName === 'Ciao Cafe'
              ? 'rgb(5, 164, 77)'
              : user.BrandName === 'Goody'
                ? 'rgb(111, 112, 114)'
                : user.BrandName === 'Nhà hàng Thanh Niên'
                  ? 'rgb(35, 32, 32)'
                  : user.BrandName === 'Niso'
                    ? '#8a6a16'
                    : '#e0d4bb'
          }}>
            {processText(getBrandData('qt1'), translations, 'Nội dung')}
            {user.PhanQuyen && canEditField('qt1') && (
              <Button
                type="text"
                icon={<EditOutlined style={{
                  color: user.BrandName === 'Ciao Cafe'
                    ? 'rgb(5, 164, 33)'
                    : user.BrandName === 'Goody'
                      ? 'rgb(111, 112, 114)'
                      : user.BrandName === 'Nhà hàng Thanh Niên'
                        ? 'rgb(35, 32, 32)'
                        : user.BrandName === 'Niso'
                          ? '#8a6a16'
                          : '#e0d4bb'
                }} />}
                onClick={() => handleEditingState('qt1', index, true)}
              />
            )}
          </b>
        )}
        <i>
          {getEditingState('qt2', index) ? (
            <EditableFieldWithActions
              value={getBrandData('qt2')}
              field="qt2"
              index={index}
              translationKey="Nội dung phụ"
              style={{
                color: getBrandStyle(user.BrandName, questions?.brand)
              }}
            />
          ) : (
            <div className="content__niso__editer" style={{
              color: user.BrandName === 'Ciao Cafe'
                ? 'rgb(5, 164, 77)'
                : user.BrandName === 'Goody'
                  ? 'rgb(111, 112, 114)'
                  : user.BrandName === 'Nhà hàng Thanh Niên'
                    ? 'rgb(35, 32, 32)'
                    : user.BrandName === 'Niso'
                      ? '#8a6a16'
                      : '#e0d4bb'
            }}>
              {processText(getBrandData('qt2'), translations, 'Nội dung phụ')}
              {user.PhanQuyen && canEditField('qt2') && (
                <Button
                  type="text"
                  icon={<EditOutlined style={{
                    color: user.BrandName === 'Ciao Cafe'
                      ? 'rgb(5, 164, 77)'
                      : user.BrandName === 'Goody'
                        ? 'rgb(111, 112, 114)'
                        : user.BrandName === 'Nhà hàng Thanh Niên'
                          ? 'rgb(35, 32, 32)'
                          : user.BrandName === 'Niso'
                            ? '#8a6a16'
                            : '#e0d4bb'
                  }} />}
                  onClick={() => handleEditingState('qt2', index, true)}
                />
              )}
            </div>
          )}
        </i>
      </p>

      {filteredQuestions?.map((question) => {
        return renderCustomQuestion(question, onEditStorageForm);
      })}

      {hasQuestions && (
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            style={{ width: '100%' }}
            size="large"
            className={`${getClassName(user.BrandName)}`}
            disabled={submitting}
          >
            <p>
              {totalSteps === 1 ? t('cauhoi.Nút submit') : currentStep === totalSteps ? t('cauhoi.Nút submit') : t('cauhoi.Nút tiếp tục')}
            </p>
          </Button>
        </Form.Item>
      )}
    </>
  );
};

export default SecondForm;