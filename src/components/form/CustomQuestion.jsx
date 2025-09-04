import React, { useEffect, useState } from 'react';
import { Rate, Radio, Input, Form, Button, Row, Col } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { getquestion } from './Custom';
import { message } from 'antd';

const CustomQuestion = ({
  question,
  getRate,
  getCheckbox,
  getInput,
  user,
  getColorRate,
  onEdit,
  onEditStorageForm,
  form,
  index,
  t
}) => {
  const [currentLang] = useState(localStorage.getItem('selectedLanguage') || 'vi');

  const getLocalizedText = (text) => {
    if (!text) return '';
    if (typeof text === 'object') {
      return text[currentLang] || text.vi || '';
    }
    return text;
  };

  useEffect(() => {
    if (question.type === 'rate') {
      form.setFieldsValue({
        [question.id]: Array(question.options?.length || 0).fill(0)
      });
    }
  }, [question, form]);

  useEffect(() => {
    if (form) {
      const currentValues = form.getFieldsValue();
      form.setFieldsValue({
        ...currentValues,
        [question.id]: question.value
      });
    }
  }, [question, form]);

  const validateRating = (_, value) => {
    if (question.required) {
      if (!value || !Array.isArray(value)) {
        return Promise.reject(new Error(t('cauhoi.Vui lòng chọn đánh giá')));
      }
      const hasUnrated = value.some(rate => !rate || rate === 0);
      if (hasUnrated) {
        return Promise.reject(new Error(t('cauhoi.Vui lòng chọn đánh giá')));
      }
    }
    return Promise.resolve();
  };

  const handleEditClick = async () => {
    if (question.fromStorage) {
      try {
        const questionData = {
          ...question,
          step: question.step || 1,
          formId: question.formId,
          formName: question.formName || { vi: '', en: '', kh: '' },
          question: question.question || { vi: '', en: '', kh: '' },
          content: question.content || { vi: '', en: '', kh: '' },
          placeholder: question.placeholder || { vi: '', en: '', kh: '' },
          options: question.options || []
        };

        onEditStorageForm({
          id: question.formId,
          formName: question.formName || { vi: '', en: '', kh: '' },
          steps: [{
            step: question.step || 1,
            questions: [questionData]
          }]
        }, true, true);
      } catch (error) {
        console.error('Lỗi khi xử lý câu hỏi:', error);
        message.error(t('cauhoi.Có lỗi xảy ra khi xử lý câu hỏi'));
      }
    } else {
      onEdit(question);
    }
  };

  return (
    <div key={question.id} style={{ position: 'relative' }}>
      {question.type === 'rate' && question.BrandName === user.BrandName && (
        <Form.Item
          name={question.id}
          initialValue={Array(question.options?.length || 0).fill(0)}
          rules={[{
            required: question.required,
            validator: validateRating
          }]}
          validateTrigger={['onChange', 'onBlur']}
        >
          <p className={user?.PhanQuyen ? 'admin_bold_niso la' : 'bold'}>
            <b className={`${getquestion(user.BrandName)} content__niso__editer bold`}>
              <span className={getquestion(user.BrandName)}>
                <span style={{
                  color: user.BrandName === 'Ciao Cafe'
                    ? 'rgb(245, 171, 33)'
                    : user.BrandName === 'Goody'
                      ? 'rgb(111, 112, 114)'
                      : user.BrandName === 'Nhà hàng Thanh Niên'
                        ? 'rgb(35, 32, 32)'
                        : user.BrandName === 'Niso'
                          ? '#ae8f3d'
                          : '#e0d4bb'
                }}>
                  {question.required && <span style={{ color: 'red', fontSize: 18, marginRight: 8 }}>*</span>}
                  {getLocalizedText(question.question)}
                </span>
                {user?.PhanQuyen && (
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
                              ? '#ae8f3d'
                              : '#e0d4bb'
                    }} />}
                    onClick={handleEditClick}
                  />
                )}
              </span>
            </b>

            {question.content && (
              <div>
                <i className={`${getquestion(user.BrandName)} content__niso__editer`} style={{
                  color: user.BrandName === 'Ciao Cafe'
                    ? 'rgb(245, 171, 33)'
                    : user.BrandName === 'Goody'
                      ? 'rgb(111, 112, 114)'
                      : user.BrandName === 'Nhà hàng Thanh Niên'
                        ? 'rgb(35, 32, 32)'
                        : user.BrandName === 'Niso'
                          ? '#ae8f3d'
                          : '#e0d4bb'
                }}>
                  {console.log('Question content:', question.content)}
                  {console.log('Localized content:', getLocalizedText(question.content))}
                  {getLocalizedText(question.content)}
                </i>
              </div>
            )}
          </p>
          <Row gutter={[24, 24]} justify="start" style={{ marginTop: 12 }}>
            {question.options?.map((option, idx) => (
              <Col key={idx} xs={24} sm={12} md={6} style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <span className={user?.PhanQuyen ? 'good__text_niso' : 'text'} style={{ width: '100%', maxWidth: '280px' }}>
                  <b className={`${getColorRate(user.BrandName)} content__niso__editer`}>
                    {getLocalizedText(option.title || option.question)}
                  </b>
                  {option.content && (
                    <p className="lo">
                      <b className={`${getColorRate(user.BrandName)} content__niso__editer italic`}>
                        {getLocalizedText(option.content)}
                      </b>
                    </p>
                  )}
                  <Rate
                    onChange={(value) => {
                      const currentValues = form.getFieldValue(question.id) || Array(question.options?.length || 0).fill(0);
                      currentValues[idx] = value;
                      form.setFieldsValue({ [question.id]: currentValues });
                    }}
                    className={`${getRate(user.BrandName)}`}
                  />
                </span>
              </Col>
            ))}
          </Row>
        </Form.Item>
      )}

      {(question.type === 'text' || question.type === 'textarea') && question.BrandName === user.BrandName && (
        <Form.Item
          name={question.id}
          rules={[{ required: question.required, message: t('cauhoi.This field is required') }]}
        >
          <div>
            <div>
              <b className={`content__niso__editer`} style={{
                color: user.BrandName === 'Ciao Cafe'
                  ? '#902b8a'
                  : user.BrandName === 'Goody'
                    ? 'rgb(111, 112, 114)'
                    : user.BrandName === 'Nhà hàng Thanh Niên'
                      ? 'rgb(35, 32, 32)'
                      : user.BrandName === 'Niso'
                        ? '#ae8f3d'
                        : '#e0d4bb'
              }}>
                {question.required && <span style={{ color: 'red', fontSize: 18, marginRight: 8 }}>*</span>}
                {getLocalizedText(question.question)}
              </b>
              {user?.PhanQuyen && (
                <Button
                  type="text"
                  icon={<EditOutlined style={{
                    color: user.BrandName === 'Ciao Cafe'
                      ? 'rgb(144, 43, 138)'
                      : user.BrandName === 'Goody'
                        ? 'rgb(111, 112, 114)'
                        : user.BrandName === 'Nhà hàng Thanh Niên'
                          ? 'rgb(35, 32, 32)'
                          : user.BrandName === 'Niso'
                            ? '#ae8f3d'
                            : '#e0d4bb'
                  }} />}
                  onClick={handleEditClick}
                />
              )}
            </div>
            {question.type === 'text' && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Input
                  className={getInput(user.BrandName)}
                  size='large'
                  autoComplete="off"
                  type={question.dataType || 'text'}
                  placeholder={getLocalizedText(question.placeholder)}
                />
                {question.required && !question.question && <span className='checker'>*</span>}
              </div>
            )}
            {question.type === 'textarea' && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Input.TextArea
                  className={getInput(user.BrandName)}
                  size='large'
                  autoComplete="off"
                  placeholder={getLocalizedText(question.placeholder)}
                  rows={4}
                  style={{ minHeight: 120 }}
                />
                {question.required && !question.question && <span className='checker'>*</span>}
              </div>
            )}
          </div>
        </Form.Item>
      )}

      {question.type === 'choice' && question.BrandName === user.BrandName && (
        <Form.Item
          name={question.id}
          rules={[{ required: question.required, message: t('cauhoi.This field is required') }]}
        >
          <div>
            <b className={`content__niso__editer`} style={{
              color: user.BrandName === 'Ciao Cafe'
                ? '#e61389'
                : user.BrandName === 'Goody'
                  ? 'rgb(111, 112, 114)'
                  : user.BrandName === 'Nhà hàng Thanh Niên'
                    ? 'rgb(35, 32, 32)'
                    : user.BrandName === 'Niso'
                      ? '#ae8f3d'
                      : '#e0d4bb'
            }}>
              {question.required && <span style={{ color: 'red', fontSize: 18, marginRight: 8 }}>*</span>}
              {getLocalizedText(question.question)}
              {user?.PhanQuyen && (
                <Button
                  type="text"
                  icon={<EditOutlined style={{
                    color: user.BrandName === 'Ciao Cafe'
                      ? '#e61389'
                      : user.BrandName === 'Goody'
                        ? 'rgb(111, 112, 114)'
                        : user.BrandName === 'Nhà hàng Thanh Niên'
                          ? 'rgb(35, 32, 32)'
                          : user.BrandName === 'Niso'
                            ? '#ae8f3d'
                            : '#e0d4bb'
                  }} />}
                  onClick={handleEditClick}
                />
              )}
            </b>
            <p className='lav'>
              {question.content && (
                <i className={`content__niso__editer italic`} style={{
                  color: user.BrandName === 'Ciao Cafe'
                    ? '#e61389'
                    : user.BrandName === 'Goody'
                      ? 'rgb(111, 112, 114)'
                      : user.BrandName === 'Nhà hàng Thanh Niên'
                        ? 'rgb(35, 32, 32)'
                        : user.BrandName === 'Niso'
                          ? '#ae8f3d'
                          : '#e0d4bb'
                }}>
                  {getLocalizedText(question.content)}
                </i>
              )}
            </p>
            <Radio.Group className={getCheckbox()} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              {question.options?.map((option, index) => {
                const optionText = getLocalizedText(option.title || option);

                return (
                  <Radio
                    key={index}
                    value={optionText}
                    style={{ margin: 0 }}
                    className={`${getCheckbox()} ${getColorRate(user.BrandName)} size__niso ${user.BrandName === 'Ciao Cafe' || user.BrandName === 'Goody'
                      ? 'customRadioNisociao'
                      : user.BrandName === 'Nhà hàng Thanh Niên'
                        ? 'customRadioNisonhtn'
                        : user.BrandName === 'RuNam' || user.BrandName === "RuNam D'or"
                          ? 'customRadioNisorunam'
                          : user.BrandName === 'Niso'
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
        </Form.Item>
      )}
      
    </div>
  );
};

export default CustomQuestion;