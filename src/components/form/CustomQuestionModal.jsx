import React, { useState, useEffect, memo } from 'react';
import { Drawer, Form, Select, Input, Button, Space, Checkbox, Divider, Rate, Modal, Tabs } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { message } from 'antd';
import axios from 'axios';
import { getDraw, getSelect, getquestion2, getTabs } from './Custom';

const { TabPane } = Tabs;

const CustomQuestionModal = ({
  user,
  getClassName,
  getModal,
  getInput,
  showCustomQuestionForm,
  questionType,
  setQuestionType,
  setCustomQuestion,
  t,
  getRate,
  isRequired,
  setIsRequired,
  rateOptions,
  setRateOptions,
  answerOptions,
  setAnswerOptions,
  getquestion,
  dataType,
  setDataType,
  editingQuestion,
  onClose,
  onEdit,
  onDelete,
  setPlaceholder,
  fetchQuestions,
  customQuestions,
  setCustomQuestions,
  onQuestionUpdate
}) => {
  const [subQuestions, setSubQuestions] = useState([
    {
      title: '',
      content: '',
      required: false,
      rate: 0
    }
  ]);

  const [form] = Form.useForm();

  const [selectedStep, setSelectedStep] = useState(1);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    content: {
      vi: '',
      en: '',
      kh: ''
    },
    placeholder: {
      vi: '',
      en: '',
      kh: ''
    },
    question: {
      vi: '',
      en: '',
      kh: ''
    }
  });

  const [activeTabKeyContent, setActiveTabKeyContent] = useState('vi');
  const [activeTabKeyPlaceholder, setActiveTabKeyPlaceholder] = useState('vi');
  const [activeTabKeyOptions, setActiveTabKeyOptions] = useState('vi');
  const [activeTabKeySubQuestionTitle, setActiveTabKeySubQuestionTitle] = useState('vi');
  const [activeTabKeySubQuestionContent, setActiveTabKeySubQuestionContent] = useState('vi');

  useEffect(() => {
    if (editingQuestion) {
      setQuestionType(editingQuestion.type);
      setCustomQuestion(editingQuestion.question);
      setIsRequired(editingQuestion.required);
      setDataType(editingQuestion.dataType || 'text');
      setSelectedStep(editingQuestion.step || 1);

      form.setFieldsValue({
        placeholder: editingQuestion.placeholder || '',
        content: editingQuestion.content || '',
      });

      if (editingQuestion.type === 'rate' && editingQuestion.options) {
        setSubQuestions(editingQuestion.options.map(opt => ({
          title: opt.title || opt.question || '',
          content: opt.content || opt.description || '',
          required: opt.required,
          rate: opt.defaultRate || opt.rate || 0
        })));
      } else if (editingQuestion.type === 'choice' && editingQuestion.options) {
        setAnswerOptions(editingQuestion.options);
      }
    }
  }, [
    editingQuestion,
    setQuestionType,
    setCustomQuestion,
    setIsRequired,
    setDataType,
    setAnswerOptions,
    setSelectedStep,
    user.BrandName,
    form
  ]);


  useEffect(() => {
    if (!showCustomQuestionForm) {
      setFormData({
        content: {
          vi: '',
          en: '',
          kh: ''
        },
        placeholder: {
          vi: '',
          en: '',
          kh: ''
        },
        question: {
          vi: '',
          en: '',
          kh: ''
        }
      });
    }
  }, [showCustomQuestionForm]);

  useEffect(() => {
    if (editingQuestion) {
      setFormData({
        content: {
          vi: typeof editingQuestion.content === 'object' ? editingQuestion.content.vi : editingQuestion.content || '',
          en: typeof editingQuestion.content === 'object' ? editingQuestion.content.en : '',
          kh: typeof editingQuestion.content === 'object' ? editingQuestion.content.kh : ''
        },
        placeholder: {
          vi: typeof editingQuestion.placeholder === 'object' ? editingQuestion.placeholder.vi : editingQuestion.placeholder || '',
          en: typeof editingQuestion.placeholder === 'object' ? editingQuestion.placeholder.en : '',
          kh: typeof editingQuestion.placeholder === 'object' ? editingQuestion.placeholder.kh : ''
        },
        question: {
          vi: typeof editingQuestion.question === 'object' ? editingQuestion.question.vi : editingQuestion.question || '',
          en: typeof editingQuestion.question === 'object' ? editingQuestion.question.en : '',
          kh: typeof editingQuestion.question === 'object' ? editingQuestion.question.kh : ''
        }
      });
    }
  }, [editingQuestion]);

  useEffect(() => {
    console.log('subQuestions:', subQuestions);
  }, [subQuestions]);

  useEffect(() => {
    if (editingQuestion) {
      const currentLang = localStorage.getItem('selectedLanguage') || 'vi';
      setActiveTabKeyContent(currentLang);
      setActiveTabKeyPlaceholder(currentLang);
      setActiveTabKeyOptions(currentLang);
    } else {
      setActiveTabKeyContent('vi');
      setActiveTabKeyPlaceholder('vi');
      setActiveTabKeyOptions('vi');
    }
  }, [editingQuestion]);

  const handleAddOption = () => {
    setAnswerOptions([...answerOptions, '']);
  };

  const handleRemoveOption = (index) => {
    const newOptions = answerOptions.filter((_, i) => i !== index);
    setAnswerOptions(newOptions);
  };

  const handleAnswerOptionChange = (index, lang, value) => {
    setAnswerOptions(prevOptions => {
      const newOptions = [...prevOptions];
      if (typeof newOptions[index] !== 'object') {
        const oldValue = newOptions[index];
        newOptions[index] = {
          vi: oldValue || '',
          en: oldValue || '',
          kh: oldValue || ''
        };
      }
      newOptions[index][lang] = value;
      return newOptions;
    });
  };

  const handleAddSubQuestion = () => {
    if (subQuestions.length < 4) {
      setSubQuestions([
        ...subQuestions,
        {
          title: '',
          content: '',
          required: false,
          rate: 0
        }
      ]);
    } else {
      message.warning(t('cauhoi.Chỉ được tối đa 4 câu hỏi đánh giá'));
    }
  };

  const handleRemoveSubQuestion = (index) => {
    Modal.confirm({
      title: t('cauhoi.Xác nhận xóa'),
      content: t('cauhoi.Bạn có chắc chắn muốn xóa câu hỏi phụ này?'),
      className: `${getModal(user.BrandName)}`,
      okText: <p style={{ fontSize: 12 }}>{t('cauhoi.Xóa')}</p>,
      cancelText: <p style={{ fontSize: 12 }}>{t('cauhoi.Hủy')}</p>,
      okButtonProps: {
        className: `${getClassName(user.BrandName)} static button-full-width`,
        size: 'small',
        style: {
          fontSize: '12px'
        }
      },
      cancelButtonProps: {
        className: `${getClassName(user.BrandName)} static button-full-width`,
        size: 'small',
        style: {
          fontSize: '12px'
        }
      },
      onOk() {
        const newSubQuestions = subQuestions.filter((_, i) => i !== index);
        setSubQuestions(newSubQuestions);
      }
    });
  };

  const handleSubQuestionChange = (index, field, lang, value) => {
    setSubQuestions(prev => {
      const updatedQuestions = [...prev];

      // Nếu field không phải là object và cần chuyển thành object
      if (lang && typeof updatedQuestions[index][field] !== 'object') {
        // Lưu giá trị cũ
        const oldValue = updatedQuestions[index][field];

        // Tạo object mới với giá trị cũ
        updatedQuestions[index][field] = {
          vi: oldValue,
          en: oldValue,
          kh: oldValue
        };
      }

      // Cập nhật giá trị mới
      if (lang) {
        updatedQuestions[index][field] = {
          ...updatedQuestions[index][field],
          [lang]: value
        };
      } else {
        updatedQuestions[index][field] = value;
      }

      return updatedQuestions;
    });
  };

  const resetForm = () => {
    setQuestionType('');
    setCustomQuestion('');
    setDataType('text');
    setIsRequired(false);
    setRateOptions(['', '', '', '']);
    setAnswerOptions(['']);
    setSubQuestions([{ title: '', content: '', required: false, rate: 0 }]);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const payload = {
        brandName: user.BrandName,
        type: questionType,
        question: formData.question,
        content: formData.content,
        placeholder: formData.placeholder,
        required: isRequired,
        options: questionType === 'rate' ? subQuestions : answerOptions,
        dataType: dataType,
        step: selectedStep
      };

      if (editingQuestion) {
        const response = await axios.put(`/question/custom/${editingQuestion.id}`, {
          ...payload,
          id: editingQuestion.id
        }, {
          headers: {
            'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
          }
        });

        if (response.data.success) {
          message.success(t('cauhoi.Cập nhật câu hỏi thành công'));
          onQuestionUpdate && onQuestionUpdate();
        }
      } else {
        const response = await axios.post('/question/custom/add', payload, {
          headers: {
            'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
          }
        });

        if (response.data.success) {
          message.success(t('cauhoi.Tạo câu hỏi thành công'));
          onQuestionUpdate && onQuestionUpdate();
        }
      }

      onClose();
    } catch (error) {
      console.error('Lỗi khi xử lý câu hỏi:', error);
      message.error(error.message || t('cauhoi.Có lỗi xảy ra'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };


  return (
    <Drawer
      title={`${editingQuestion ? t('cauhoi.Chỉnh sửa') : t('cauhoi.Tạo')} ${user.BrandName}`}
      open={showCustomQuestionForm}
      onClose={handleClose}
      width={1000}
      bodyStyle={{
        background: `${getDraw(user.BrandName)}`,
        paddingBottom: 80
      }}
      headerStyle={{
        background: `${getDraw(user.BrandName)}`
      }}
      footerStyle={{background: `${getDraw(user.BrandName)}`}}
      footer={
        <Button
          type="primary"
          htmlType="submit"
          className={`${getClassName(user.BrandName)} static button-full-width`}
          onClick={() => form.submit()}
          loading={loading}
          block
        >
          <p style={{ fontSize: 12 }}>{editingQuestion ? t('cauhoi.Cập nhật câu hỏi') : t('cauhoi.Tạo câu hỏi')}</p>
        </Button>
      }
      extra={
        <Button
          type="primary"
          size='small'
          className={`${getClassName(user.BrandName)} static button-full-width`}
          icon={<DeleteOutlined />}
          onClick={() => {
            onDelete(editingQuestion);
          }}
        >
          <p style={{ fontSize: '12px' }}>{t('cauhoi.Xóa câu hỏi')}</p>
        </Button>
      }
    >
      {editingQuestion && (
        <>
          <Modal
            title={t('cauhoi.Xác nhận xóa')}
            open={deleteModalVisible}
            onOk={() => {
              onDelete(editingQuestion);
              setDeleteModalVisible(false);
              handleClose();
            }}
            onCancel={() => setDeleteModalVisible(false)}
            okText={t('cauhoi.Xóa')}
            cancelText={t('cauhoi.Hủy')}
            okButtonProps={{
              style: { backgroundColor: '#ae8f3d', borderColor: '#ae8f3d' }
            }}
          >
            <p>{t('cauhoi.Bạn có chắc chắn muốn xóa câu hỏi này?')}</p>
          </Modal>
        </>
      )}
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label={<span className={getquestion2(user.BrandName)}>{t('cauhoi.Loại câu hỏi')}</span>}
          rules={[{ required: true, message: t('cauhoi.Please select an option') }]}
        >
          <Select
            value={questionType || undefined}
            placeholder={t('cauhoi.Chọn loại câu hỏi')}
            onChange={value => {
              setQuestionType(value);
              if (value === 'text') {
                setDataType(value);
              }
            }}
            className={getSelect(user.BrandName)}
            disabled={!!editingQuestion}
          >
            <Select.Option value="text">{t('cauhoi.Dạng trả lời câu hỏi')}</Select.Option>
            <Select.Option value="textarea">{t('cauhoi.Dạng trả lời văn bản')}</Select.Option>
            <Select.Option value="rate">{t('cauhoi.Dạng đánh giá')}</Select.Option>
            <Select.Option value="choice">{t('cauhoi.Dạng lựa chọn')}</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label={<span className={getquestion2(user.BrandName)}>{t('cauhoi.Câu hỏi')}</span>}
        >
          <Tabs
            className={getTabs(user.BrandName)}
            activeKey={activeTabKeyContent}
            onChange={setActiveTabKeyContent}
          >
            <TabPane tab={t('cauhoi.Tiếng Việt')} key="vi">
              <Input
                className={getInput(user.BrandName)}
                value={formData.question.vi}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  question: { ...prev.question, vi: e.target.value }
                }))}
                placeholder={t('cauhoi.Nhập câu hỏi tiếng Việt')}
              />
            </TabPane>
            <TabPane tab={t('cauhoi.Tiếng Anh')} key="en">
              <Input
                className={getInput(user.BrandName)}
                value={formData.question.en}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  question: { ...prev.question, en: e.target.value }
                }))}
                placeholder={t('cauhoi.Nhập câu hỏi tiếng Anh')}
              />
            </TabPane>
            <TabPane tab={t('cauhoi.Tiếng Campuchia')} key="kh">
              <Input
                className={getInput(user.BrandName)}
                value={formData.question.kh}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  question: { ...prev.question, kh: e.target.value }
                }))}
                placeholder={t('cauhoi.Nhập câu hỏi tiếng Campuchia')}
              />
            </TabPane>
          </Tabs>
        </Form.Item>

        {questionType === 'text' && (
          <Select
            value={dataType}
            onChange={value => {
              setDataType(value);
            }}
            placeholder={t('cauhoi.Chọn loại')}
            className={getSelect(user.BrandName)}
            style={{ width: '100%', marginBottom: 16 }}
          >
            <Select.Option value="text">{t('cauhoi.Text')}</Select.Option>
            <Select.Option value="email">{t('cauhoi.Email')}</Select.Option>
            <Select.Option value="number">{t('cauhoi.Number')}</Select.Option>
          </Select>
        )}

        {questionType === 'rate' && (
          <Form.Item
            label={<span className={getquestion2(user.BrandName)}>{t('cauhoi.Nội dung mô tả')}</span>}
            name="content"
          >
            <Form.Item name="content" noStyle>
              <Tabs
                className={getTabs(user.BrandName)}
                activeKey={activeTabKeyOptions}
                onChange={setActiveTabKeyOptions}
              >
                <TabPane tab={t('cauhoi.Tiếng Việt')} key="vi">
                  <Input.TextArea
                    className={getInput(user.BrandName)}
                    rows={3}
                    placeholder={t('cauhoi.Nhập nội dung mô tả cho câu hỏi đánh giá')}
                    value={formData.content.vi}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        content: {
                          ...prev.content,
                          vi: newValue
                        }
                      }));
                    }}
                  />
                </TabPane>
                <TabPane tab={t('cauhoi.Tiếng Anh')} key="en">
                  <Input.TextArea
                    className={getInput(user.BrandName)}
                    rows={3}
                    placeholder={t('cauhoi.Nhập nội dung mô tả cho câu hỏi đánh giá')}
                    value={formData.content.en}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        content: {
                          ...prev.content,
                          en: newValue
                        }
                      }));
                    }}
                  />
                </TabPane>
                <TabPane tab={t('cauhoi.Tiếng Campuchia')} key="kh">
                  <Input.TextArea
                    className={getInput(user.BrandName)}
                    rows={3}
                    placeholder={t('cauhoi.Nhập nội dung mô tả cho câu hỏi đánh giá')}
                    value={formData.content.kh}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        content: {
                          ...prev.content,
                          kh: newValue
                        }
                      }));
                    }}
                  />
                </TabPane>
              </Tabs>
            </Form.Item>
          </Form.Item>
        )}

        {questionType === 'rate' && (
          <div>
            <Divider className={getquestion2(user.BrandName)}>{t('cauhoi.Câu hỏi phụ')}</Divider>

            {subQuestions.map((question, index) => (
              <div key={`subq-${index}`} style={{ marginBottom: 16, border: '1px dashed #d9d9d9', padding: 16, borderRadius: 8 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Form.Item
                    label={<span className={getquestion2(user.BrandName)}>{t('cauhoi.Tiêu đề câu hỏi phụ')} {index + 1}</span>}
                    required
                  >
                    <Tabs
                      className={getTabs(user.BrandName)}
                      activeKey={activeTabKeySubQuestionTitle}
                      onChange={(key) => {
                        setActiveTabKeySubQuestionTitle(key);
                        // Cập nhật state để hiển thị nội dung tương ứng với ngôn ngữ được chọn
                        subQuestions.forEach((question, index) => {
                          if (typeof question.title === 'object') {
                            const currentValue = question.title[key] || '';
                            handleSubQuestionChange(index, 'title', key, currentValue);
                          }
                        });
                      }}
                    >
                      <TabPane tab={t('cauhoi.Tiếng Việt')} key="vi">
                        <Input
                          value={
                            typeof question.title === 'object'
                              ? question.title[activeTabKeySubQuestionTitle]
                              : question.title || ''
                          }
                          onChange={e => handleSubQuestionChange(index, 'title', activeTabKeySubQuestionTitle, e.target.value)}
                          className={getInput(user.BrandName)}
                          placeholder={t('cauhoi.Nhập tiêu đề câu hỏi phụ')}
                        />
                      </TabPane>
                      <TabPane tab={t('cauhoi.Tiếng Anh')} key="en">
                        <Input
                          value={
                            typeof question.title === 'object'
                              ? question.title.en
                              : question.title || ''
                          }
                          onChange={e => handleSubQuestionChange(index, 'title', 'en', e.target.value)}
                          className={getInput(user.BrandName)}
                          placeholder={t('cauhoi.Nhập tiêu đề câu hỏi phụ')}
                        />
                      </TabPane>
                      <TabPane tab={t('cauhoi.Tiếng Campuchia')} key="kh">
                        <Input
                          value={
                            typeof question.title === 'object'
                              ? question.title.kh
                              : question.title || ''
                          }
                          onChange={e => handleSubQuestionChange(index, 'title', 'kh', e.target.value)}
                          className={getInput(user.BrandName)}
                          placeholder={t('cauhoi.Nhập tiêu đề câu hỏi phụ')}
                        />
                      </TabPane>
                    </Tabs>
                  </Form.Item>

                  <Form.Item
                    label={<span className={getquestion2(user.BrandName)}>{t('cauhoi.Nội dung câu hỏi phụ')} {index + 1}</span>}
                    required
                  >
                    <Tabs
                      className={getTabs(user.BrandName)}
                      activeKey={activeTabKeySubQuestionContent}
                      onChange={setActiveTabKeySubQuestionContent}
                    >
                      <TabPane tab={t('cauhoi.Tiếng Việt')} key="vi">
                        <Input.TextArea
                          value={
                            typeof question.content === 'object'
                              ? question.content.vi
                              : question.content || ''
                          }
                          onChange={e => handleSubQuestionChange(index, 'content', 'vi', e.target.value)}
                          className={getInput(user.BrandName)}
                          rows={2}
                          placeholder={t('cauhoi.Nhập nội dung câu hỏi phụ')}
                        />
                      </TabPane>
                      <TabPane tab={t('cauhoi.Tiếng Anh')} key="en">
                        <Input.TextArea
                          value={
                            typeof question.content === 'object'
                              ? question.content.en
                              : question.content || ''
                          }
                          onChange={e => handleSubQuestionChange(index, 'content', 'en', e.target.value)}
                          className={getInput(user.BrandName)}
                          rows={2}
                          placeholder={t('cauhoi.Nhập nội dung câu hỏi phụ')}
                        />
                      </TabPane>
                      <TabPane tab={t('cauhoi.Tiếng Campuchia')} key="kh">
                        <Input.TextArea
                          value={
                            typeof question.content === 'object'
                              ? question.content.kh
                              : question.content || ''
                          }
                          onChange={e => handleSubQuestionChange(index, 'content', 'kh', e.target.value)}
                          className={getInput(user.BrandName)}
                          rows={2}
                          placeholder={t('cauhoi.Nhập nội dung câu hỏi phụ')}
                        />
                      </TabPane>
                    </Tabs>
                  </Form.Item>

                  <Form.Item label={<span className={getquestion2(user.BrandName)}>Đánh giá mẫu</span>}>
                    <Rate
                      value={question.rate}
                      onChange={value => handleSubQuestionChange(index, 'rate', null, value)}
                      className={getRate(user.BrandName)}
                    />
                  </Form.Item>

                  {index > 0 && (
                    <Space>
                      <Button
                        type="primary"
                        className={`${getClassName(user.BrandName)} static button-full-width`}
                        onClick={() => handleRemoveSubQuestion(index)}
                        icon={<DeleteOutlined />}
                      >
                        <p style={{ fontSize: '12px' }}>{t('cauhoi.Xóa câu hỏi phụ này')}</p>
                      </Button>
                    </Space>
                  )}
                </Space>
              </div>
            ))}

            {subQuestions.length < 4 && (
              <Button
                type="primary"
                className={`${getClassName(user.BrandName)} static button-full-width`}
                onClick={handleAddSubQuestion}
                block
                icon={<PlusOutlined />}
                style={{ marginTop: 16, marginBottom: 16 }}
              >
                <p style={{ fontSize: '12px' }}>{t('cauhoi.Thêm câu hỏi phụ')}</p>
              </Button>
            )}
          </div>
        )}

        {questionType === 'choice' && (
          <div>
            <Form.Item
              label={<span className={getquestion2(user.BrandName)}>{t('cauhoi.Nội dung mô tả')}</span>}
            >
              <Tabs
                className={getTabs(user.BrandName)}
                activeKey={activeTabKeyContent}
                onChange={setActiveTabKeyContent}
              >
                <TabPane tab={t('cauhoi.Tiếng Việt')} key="vi">
                  <Input.TextArea
                    className={getInput(user.BrandName)}
                    rows={3}
                    placeholder={t('cauhoi.Nhập nội dung mô tả cho câu hỏi')}
                    value={formData.content.vi}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        content: {
                          ...prev.content,
                          vi: newValue
                        }
                      }));
                    }}
                  />
                </TabPane>
                <TabPane tab={t('cauhoi.Tiếng Anh')} key="en">
                  <Input.TextArea
                    className={getInput(user.BrandName)}
                    rows={3}
                    placeholder={t('cauhoi.Nhập nội dung mô tả cho câu hỏi')}
                    value={formData.content.en}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        content: {
                          ...prev.content,
                          en: newValue
                        }
                      }));
                    }}
                  />
                </TabPane>
                <TabPane tab={t('cauhoi.Tiếng Campuchia')} key="kh">
                  <Input.TextArea
                    className={getInput(user.BrandName)}
                    rows={3}
                    placeholder={t('cauhoi.Nhập nội dung mô tả cho câu hỏi')}
                    value={formData.content.kh}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        content: {
                          ...prev.content,
                          kh: newValue
                        }
                      }));
                    }}
                  />
                </TabPane>
              </Tabs>
            </Form.Item>

            {Array.isArray(answerOptions) && answerOptions.map((option, index) => (
              <Form.Item
                label={<span className={getquestion2(user.BrandName)}>{t('cauhoi.Lựa chọn')} {index + 1}</span>}
                key={index}
                rules={[{ required: true, message: t('cauhoi.Vui lòng nhập nội dung lựa chọn') }]}
              >
                <Tabs
                  className={getTabs(user.BrandName)}
                  activeKey={activeTabKeyOptions}
                  onChange={setActiveTabKeyOptions}
                >
                  <TabPane tab={t('cauhoi.Tiếng Việt')} key="vi">
                    <Input
                      value={typeof option === 'object' ? option.vi : option}
                      onChange={e => handleAnswerOptionChange(index, 'vi', e.target.value)}
                      className={getInput(user.BrandName)}
                      placeholder={`${t('cauhoi.Nội dung lựa chọn')} ${index + 1}`}
                    />
                  </TabPane>
                  <TabPane tab={t('cauhoi.Tiếng Anh')} key="en">
                    <Input
                      value={typeof option === 'object' ? option.en : ''}
                      onChange={e => handleAnswerOptionChange(index, 'en', e.target.value)}
                      className={getInput(user.BrandName)}
                      placeholder={`${t('cauhoi.Nội dung lựa chọn')} ${index + 1}`}
                    />
                  </TabPane>
                  <TabPane tab={t('cauhoi.Tiếng Campuchia')} key="kh">
                    <Input
                      value={typeof option === 'object' ? option.kh : ''}
                      onChange={e => handleAnswerOptionChange(index, 'kh', e.target.value)}
                      className={getInput(user.BrandName)}
                      placeholder={`${t('cauhoi.Nội dung lựa chọn')} ${index + 1}`}
                    />
                  </TabPane>
                </Tabs>
                {index > 0 && (
                  <Button
                    onClick={() => handleRemoveOption(index)}
                    icon={<DeleteOutlined />}
                    style={{ marginTop: 16, float: 'right' }}
                    className={`${getClassName(user.BrandName)} static button-full-width`}
                  >
                    <p style={{ fontSize: 12 }}>{t('cauhoi.Xóa')}</p>
                  </Button>
                )}
              </Form.Item>
            ))}
            <Button
              onClick={handleAddOption}
              className={`${getClassName(user.BrandName)} static button-full-width`}
              style={{ marginBottom: 16 }}
            >
              <p style={{ fontSize: 12 }}>{t('cauhoi.Thêm lựa chọn')}</p>
            </Button>
          </div>
        )}

        {(questionType === 'text' || questionType === 'textarea') && (
          <>
            <Form.Item
              label={<span className={getquestion2(user.BrandName)}>Placeholder</span>}
              name="content"
            >
              <Tabs
                className={getTabs(user.BrandName)}
                activeKey={activeTabKeyPlaceholder}
                onChange={setActiveTabKeyPlaceholder}
              >
                <TabPane tab={t('cauhoi.Tiếng Việt')} key="vi">
                  <Input.TextArea
                    placeholder={t('cauhoi.Nhập nội dung cho trường nhập liệu')}
                    className={getInput(user.BrandName)}
                    value={formData.placeholder.vi}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        placeholder: {
                          ...prev.placeholder,
                          vi: newValue
                        }
                      }));
                    }}
                    rows={4}
                  />
                </TabPane>
                <TabPane tab={t('cauhoi.Tiếng Anh')} key="en">
                  <Input.TextArea
                    placeholder={t('cauhoi.Nhập nội dung cho trường nhập liệu')}
                    className={getInput(user.BrandName)}
                    value={formData.placeholder.en}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        placeholder: {
                          ...prev.placeholder,
                          en: newValue
                        }
                      }));
                    }}
                    rows={4}
                  />
                </TabPane>
                <TabPane tab={t('cauhoi.Tiếng Campuchia')} key="kh">
                  <Input.TextArea
                    placeholder={t('cauhoi.Nhập nội dung cho trường nhập liệu')}
                    className={getInput(user.BrandName)}
                    value={formData.placeholder.kh}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        placeholder: {
                          ...prev.placeholder,
                          kh: newValue
                        }
                      }));
                    }}
                    rows={4}
                  />
                </TabPane>
              </Tabs>
            </Form.Item>
          </>
        )}

        <Form.Item label={<span className={getquestion2(user.BrandName)}>{t('cauhoi.Thứ tự step')}</span>}>
          <Select
            value={selectedStep}
            onChange={value => setSelectedStep(value)}
            className={`${getSelect(user.BrandName)}`}
          >
            {Array.from({ length: 10 }, (_, i) => (
              <Select.Option
                key={i + 1}
                value={i + 1}
              >
                Step {i + 1}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <Checkbox
            checked={isRequired}
            onChange={e => setIsRequired(e.target.checked)}
            className='checkboxniso'
          >
            <p className={getquestion2(user.BrandName)}>{t('cauhoi.Câu hỏi bắt buộc')}</p>
          </Checkbox>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default memo(CustomQuestionModal);