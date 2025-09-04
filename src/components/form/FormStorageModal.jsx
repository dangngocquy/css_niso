import React, { useState, memo, useEffect } from 'react';
import { Drawer, Form, Select, Input, Button, message, Tabs, Checkbox, Divider, Rate, Space } from 'antd';
import { DeleteOutlined, PlusOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import axios from 'axios';
import { getDraw, getSelect, getInput, getquestion2, getTabs, getRate } from './Custom';
import { v4 as uuidv4 } from 'uuid';
import CopyStepModal from './CopyStepModal';

const { TabPane } = Tabs;

const FormStorageModal = ({
  user,
  getClassName,
  showFormStorageModal,
  onClose,
  t,
  onSubmit,
  editingForm,
  isEditQuestion = false,
  hideControls = false,
  onUpdate
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps, setTotalSteps] = useState(1);
  const [stepsData, setStepsData] = useState({});
  const [activeTabKey, setActiveTabKey] = useState('vi');
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [formData, setFormData] = useState({
    formName: editingForm ? editingForm.formName : { vi: '', en: '', kh: '' },
    brandName: null,
    chinhanh: null,
    steps: editingForm ? editingForm.steps : []
  });
  const [questionsData, setQuestionsData] = useState({});

  const getBrandColor = (brandName) => {
    switch (brandName) {
      case "RuNam":
      case "RuNam D'or":
        return "#ae8f3d";
      case "Goody":
        return "#797a7c";
      case "Ciao Cafe":
        return "#797a7c";
      case "Nhà hàng Thanh Niên":
        return "#232020";
      default:
        return "";
    }
  };

  useEffect(() => {
    if (editingForm) {
      const stepData = {};
      const questionsData = {};

      editingForm.steps.forEach(step => {
        questionsData[step.step] = {};
        step.questions.forEach((question, index) => {
          questionsData[step.step][index] = {
            question: question.question || { vi: '', en: '', kh: '' },
            type: question.type || '',
            required: question.required || false,
            dataType: question.dataType || 'text',
            options: question.options || (question.type === 'rate' ? [{ title: { vi: '', en: '', kh: '' }, content: { vi: '', en: '', kh: '' }, required: false, rate: 0 }] : [{ vi: '', en: '', kh: '' }]),
            content: question.content || { vi: '', en: '', kh: '' },
            placeholder: question.placeholder || { vi: '', en: '', kh: '' },
            id: question.id
          };
        });

        stepData[step.step] = {
          formName: editingForm.formName || { vi: '', en: '', kh: '' },
          content: step.questions[0]?.content || { vi: '', en: '', kh: '' },
          placeholder: step.questions[0]?.placeholder || { vi: '', en: '', kh: '' },
          question: step.questions[0]?.question || { vi: '', en: '', kh: '' },
          type: step.questions[0]?.type || '',
          required: step.questions[0]?.required || false,
          dataType: step.questions[0]?.dataType || 'text',
          options: step.questions[0]?.options || (step.questions[0]?.type === 'rate' ? [{ title: { vi: '', en: '', kh: '' }, content: { vi: '', en: '', kh: '' }, required: false, rate: 0 }] : [{ vi: '', en: '', kh: '' }]),
          chinhanh: editingForm.chinhanh || null
        };
      });

      setStepsData(stepData);
      setCurrentStep(editingForm.steps[0]?.step || 1);
      setTotalSteps(editingForm.steps.length || 1);
      setFormData({
        formName: editingForm.formName || { vi: '', en: '', kh: '' },
        content: stepData[1]?.content || { vi: '', en: '', kh: '' },
        placeholder: stepData[1]?.placeholder || { vi: '', en: '', kh: '' },
        question: stepData[1]?.question || { vi: '', en: '', kh: '' }
      });
      setQuestionsData(questionsData);

      const formValues = {
        formName: editingForm.formName?.vi || ''
      };

      // Set values for each question
      Object.keys(questionsData).forEach(step => {
        Object.keys(questionsData[step]).forEach(questionIndex => {
          const question = questionsData[step][questionIndex];
          formValues[`question_${questionIndex}`] = question.question?.vi || '';
          formValues[`questionType_${questionIndex}`] = question.type || '';
          formValues[`content_${questionIndex}`] = question.content?.vi || '';
          formValues[`placeholder_${questionIndex}`] = question.placeholder?.vi || '';
        });
      });

      form.setFieldsValue(formValues);
    } else {
      setStepsData({});
      setCurrentStep(1);
      setTotalSteps(1);
      setFormData({
        formName: { vi: '', en: '', kh: '' },
        content: { vi: '', en: '', kh: '' },
        placeholder: { vi: '', en: '', kh: '' },
        question: { vi: '', en: '', kh: '' }
      });
      setQuestionsData({});
      form.resetFields();
    }
  }, [editingForm, form]);

  const validateStep = async () => {
    try {
      if (!isEditQuestion && !hideControls && currentStep === 1) {
        await form.validateFields(['formName']);
        if (!formData.formName.vi) {
          message.error(t('cauhoi.Vui lòng nhập tên form bằng tiếng Việt'));
          return false;
        }
      }

      const currentStepQuestions = questionsData[currentStep] || {};
      const questionKeys = Object.keys(currentStepQuestions);

      if (questionKeys.length === 0) {
        message.error(t('cauhoi.Vui lòng thêm ít nhất một câu hỏi'));
        return false;
      }

      for (const questionIndex of questionKeys) {
        const question = currentStepQuestions[questionIndex];
        if (!question.type) {
          message.error(t(`cauhoi.Vui lòng chọn loại câu hỏi cho câu hỏi ${parseInt(questionIndex) + 1}`));
          return false;
        }
        if (!question.question?.vi) {
          message.error(t(`cauhoi.Vui lòng nhập câu hỏi bằng tiếng Việt cho câu hỏi ${parseInt(questionIndex) + 1}`));
          return false;
        }
        if (question.type === 'choice' && question.options?.some(o => !o.vi)) {
          message.error(t(`cauhoi.Vui lòng điền đầy đủ các lựa chọn bằng tiếng Việt cho câu hỏi ${parseInt(questionIndex) + 1}`));
          return false;
        }
      }
      return true;
    } catch (error) {
      message.error(t('cauhoi.Vui lòng điền đầy đủ thông tin bằng tiếng Việt'));
      return false;
    }
  };

  const handleNextStep = async () => {
    if (await validateStep()) {
      setStepsData(prev => ({
        ...prev,
        [currentStep]: {
          formName: currentStep === 1 ? formData.formName : stepsData[1]?.formName,
          questions: questionsData[currentStep]
        }
      }));

      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setTotalSteps(prev => Math.max(prev, nextStep));

      setFormData(prev => ({
        ...prev,
        formName: stepsData[1]?.formName || prev.formName,
        content: stepsData[nextStep]?.questions?.[0]?.content || { vi: '', en: '', kh: '' },
        placeholder: stepsData[nextStep]?.questions?.[0]?.placeholder || { vi: '', en: '', kh: '' },
        question: stepsData[nextStep]?.questions?.[0]?.question || { vi: '', en: '', kh: '' }
      }));

      form.resetFields();
      form.setFieldsValue({
        formName: stepsData[1]?.formName?.vi || formData.formName.vi
      });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setStepsData(prev => ({
        ...prev,
        [currentStep]: {
          formName: stepsData[1]?.formName || formData.formName,
          questions: questionsData[currentStep]
        }
      }));
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setFormData(prev => ({
        ...prev,
        formName: stepsData[1]?.formName || formData.formName,
        content: stepsData[prevStep]?.questions?.[0]?.content || { vi: '', en: '', kh: '' },
        placeholder: stepsData[prevStep]?.questions?.[0]?.placeholder || { vi: '', en: '', kh: '' },
        question: stepsData[prevStep]?.questions?.[0]?.question || { vi: '', en: '', kh: '' }
      }));
      form.resetFields();
      form.setFieldsValue({
        formName: stepsData[1]?.formName?.vi || formData.formName.vi
      });
    }
  };

  const handleSubmit = async () => {
    if (!(await validateStep())) return;

    try {
      setLoading(true);
      const formId = editingForm ? editingForm.id : uuidv4();
      const formName = formData.formName;

      if (hideControls && editingForm) {
        const questionId = editingForm.steps[0].questions[0].id;
        const questionData = {
          ...questionsData[1][0],
          id: questionId,
          formId: formId,
          formName: formName,
          BrandName: user.BrandName,
          step: 1,
          order: 0,
          fromStorage: true
        };

        const response = await axios.put(`/question/steps/${questionId}`, questionData, {
          headers: {
            'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
          }
        });

        if (response.data.success) {
          onUpdate({
            id: formId,
            formName: formName,
            steps: [{
              step: 1,
              questions: [questionData]
            }]
          });
          message.success(t('cauhoi.Cập nhật câu hỏi thành công'));
          onClose();
          return;
        } else {
          throw new Error(response.data.message || t('cauhoi.Có lỗi xảy ra khi cập nhật câu hỏi'));
        }
      }

      const formEntry = {
        id: formId,
        formName: formName,
        brandName: null,
        chinhanh: null,
        steps: [],
        createdAt: editingForm ? editingForm.createdAt : new Date().toISOString(),
        pick: editingForm ? editingForm.pick : false
      };

      for (const step in questionsData) {
        const stepQuestions = questionsData[step];
        const questions = Object.values(stepQuestions).map((question, index) => ({
          id: question.id || uuidv4(),
          type: question.type,
          question: question.question,
          content: question.content,
          required: question.required,
          options: question.options,
          dataType: question.dataType,
          name: `question_${Math.random().toString(36).substring(2, 11)}`,
          step: parseInt(step),
          order: index,
          fromStorage: true,
          formId: formId,
          BrandName: user.BrandName,
          formName: formName,
          placeholder: question.placeholder
        }));

        formEntry.steps.push({
          step: parseInt(step),
          questions: questions
        });
      }

      if (editingForm) {
        await axios.put(`/question/storage/${formId}`, formEntry, {
          headers: {
            'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
          }
        });
      } else {
        await axios.post('/question/storage/add', formEntry, {
          headers: {
            'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
          }
        });
      }

      onUpdate(formEntry);
      message.success(editingForm ? t('cauhoi.Cập nhật form lưu trữ thành công') : t('cauhoi.Tạo form lưu trữ thành công'));
      onClose();
    } catch (error) {
      console.error('Lỗi khi xử lý form:', error);
      message.error(error.message || t('cauhoi.Có lỗi xảy ra'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setStepsData({});
    setCurrentStep(1);
    setTotalSteps(1);
    setFormData({
      formName: { vi: '', en: '', kh: '' },
      content: { vi: '', en: '', kh: '' },
      placeholder: { vi: '', en: '', kh: '' },
      question: { vi: '', en: '', kh: '' }
    });
    setQuestionsData({});
    onClose();
  };

  const handleAddQuestionToStep = () => {
    setQuestionsData(prev => ({
      ...prev,
      [currentStep]: {
        ...prev[currentStep],
        [(prev[currentStep] ? Object.keys(prev[currentStep]).length : 0)]: {
          question: { vi: '', en: '', kh: '' },
          type: '',
          required: false,
          dataType: 'text',
          options: [{ vi: '', en: '', kh: '' }],
          content: { vi: '', en: '', kh: '' },
          placeholder: { vi: '', en: '', kh: '' }
        }
      }
    }));
  };

  const handleMoveQuestion = (direction, questionIndex) => {
    const currentQuestions = { ...questionsData[currentStep] };
    const questionKeys = Object.keys(currentQuestions).map(Number).sort((a, b) => a - b);
    const currentIndex = questionKeys.indexOf(Number(questionIndex));

    if (direction === 'up' && currentIndex > 0) {
      const newIndex = currentIndex - 1;
      const temp = currentQuestions[questionKeys[currentIndex]];
      currentQuestions[questionKeys[currentIndex]] = currentQuestions[questionKeys[newIndex]];
      currentQuestions[questionKeys[newIndex]] = temp;
    } else if (direction === 'down' && currentIndex < questionKeys.length - 1) {
      const newIndex = currentIndex + 1;
      const temp = currentQuestions[questionKeys[currentIndex]];
      currentQuestions[questionKeys[currentIndex]] = currentQuestions[questionKeys[newIndex]];
      currentQuestions[questionKeys[newIndex]] = temp;
    }

    setQuestionsData(prev => ({
      ...prev,
      [currentStep]: currentQuestions
    }));
  };

  const handleDeleteStep = () => {
    if (totalSteps === 1) {
      message.error(t('cauhoi.Không thể xóa step cuối cùng'));
      return;
    }

    setQuestionsData(prev => {
      const newData = { ...prev };
      delete newData[currentStep];
      return newData;
    });

    setTotalSteps(prev => prev - 1);
    if (currentStep === totalSteps) {
      setCurrentStep(prev => prev - 1);
    }

    message.success(t('cauhoi.Xóa step thành công'));
  };

  const handleCopySuccess = () => {
    if (editingForm) {
      const stepData = {};
      const questionsData = {};

      editingForm.steps.forEach(step => {
        questionsData[step.step] = {};
        step.questions.forEach((question, index) => {
          questionsData[step.step][index] = {
            question: question.question || { vi: '', en: '', kh: '' },
            type: question.type || '',
            required: question.required || false,
            dataType: question.dataType || 'text',
            options: question.options || (question.type === 'rate' ? [{ title: { vi: '', en: '', kh: '' }, content: { vi: '', en: '', kh: '' }, required: false, rate: 0 }] : [{ vi: '', en: '', kh: '' }]),
            content: question.content || { vi: '', en: '', kh: '' },
            placeholder: question.placeholder || { vi: '', en: '', kh: '' },
            id: question.id
          };
        });

        stepData[step.step] = {
          formName: editingForm.formName || { vi: '', en: '', kh: '' },
          content: step.questions[0]?.content || { vi: '', en: '', kh: '' },
          placeholder: step.questions[0]?.placeholder || { vi: '', en: '', kh: '' },
          question: step.questions[0]?.question || { vi: '', en: '', kh: '' },
          type: step.questions[0]?.type || '',
          required: step.questions[0]?.required || false,
          dataType: step.questions[0]?.dataType || 'text',
          options: step.questions[0]?.options || (step.questions[0]?.type === 'rate' ? [{ title: { vi: '', en: '', kh: '' }, content: { vi: '', en: '', kh: '' }, required: false, rate: 0 }] : [{ vi: '', en: '', kh: '' }]),
          chinhanh: editingForm.chinhanh || ''
        };
      });

      setStepsData(stepData);
      setQuestionsData(questionsData);
    }
  };

  return (
    <>
      <Drawer
        title={`${isEditQuestion ? t('cauhoi.Chỉnh sửa câu hỏi') : t('cauhoi.Tạo form lưu trữ')} - Step ${currentStep}/${totalSteps}`}
        open={showFormStorageModal}
        onClose={handleClose}
        width={1000}
        bodyStyle={{
          background: `${getDraw(user.BrandName)}`,
          paddingBottom: 80
        }}
        headerStyle={{
          background: `${getDraw(user.BrandName)}`
        }}
        footerStyle={{
          background: `${getDraw(user.BrandName)}`
        }}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              onClick={handleSubmit}
              className={`${getClassName(user.BrandName)} static button-full-width`}
              loading={loading}
            >
              <p style={{ fontSize: 12 }}>{isEditQuestion ? t('cauhoi.Cập nhật câu hỏi') : (editingForm ? t('cauhoi.Cập nhật form lưu trữ') : t('cauhoi.Tạo form lưu trữ'))}</p>
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          {!hideControls && (
            <Form.Item
              label={<span className={getquestion2(user.BrandName)}>{t('cauhoi.Tên form')}</span>}
              name="formName"
              rules={[{ required: true, message: t('cauhoi.Vui lòng nhập tên form') }]}
            >
              <Tabs
                className={getTabs(user.BrandName)}
                activeKey={activeTabKey}
                onChange={setActiveTabKey}
              >
                <TabPane tab={t('cauhoi.Tiếng Việt')} key="vi">
                  <Input
                    className={getInput(user.BrandName)}
                    value={formData.formName.vi}
                    onChange={e => {
                      setFormData(prev => ({
                        ...prev,
                        formName: { ...prev.formName, vi: e.target.value }
                      }));
                      form.setFieldsValue({ formName: e.target.value });
                    }}
                    placeholder={t('cauhoi.Nhập tên form tiếng Việt')}
                  />
                </TabPane>
                <TabPane tab={t('cauhoi.Tiếng Anh')} key="en">
                  <Input
                    className={getInput(user.BrandName)}
                    value={formData.formName.en}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      formName: { ...prev.formName, en: e.target.value }
                    }))}
                    placeholder={t('cauhoi.Nhập tên form tiếng Anh')}
                  />
                </TabPane>
                <TabPane tab={t('cauhoi.Tiếng Campuchia')} key="kh">
                  <Input
                    className={getInput(user.BrandName)}
                    value={formData.formName.kh}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      formName: { ...prev.formName, kh: e.target.value }
                    }))}
                    placeholder={t('cauhoi.Nhập tên form tiếng Campuchia')}
                  />
                </TabPane>
              </Tabs>
            </Form.Item>
          )}
          <Divider>{t('cauhoi.Câu hỏi')}</Divider>

          {Object.keys(questionsData[currentStep] || {}).map((questionIndex) => (
            <div key={`question-${questionIndex}`} style={{ marginBottom: 24, padding: 16, border: `1px solid ${getBrandColor(user.BrandName)}`, borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap:'wrap' }}>
                <h3 style={{ margin: 0 }}>{t('cauhoi.Câu hỏi')} {parseInt(questionIndex) + 1}</h3>
                <Space>
                  {!hideControls && (
                    <>
                      <Button
                        type="primary"
                        onClick={() => handleMoveQuestion('up', questionIndex)}
                        disabled={questionIndex === 0}
                        className={`${getClassName(user.BrandName)} static button-full-width`}
                      >
                        <p style={{ fontSize: 12 }}><ArrowUpOutlined /></p>
                      </Button>
                      <Button
                        type="primary"
                        onClick={() => handleMoveQuestion('down', questionIndex)}
                        disabled={questionIndex === Object.keys(questionsData[currentStep] || {}).length - 1}
                        className={`${getClassName(user.BrandName)} static button-full-width`}
                      >
                        <p style={{ fontSize: 12 }}><ArrowDownOutlined /></p>
                      </Button>
                    </>
                  )}
                  {Object.keys(questionsData[currentStep] || {}).length > 1 && !hideControls && (
                    <Button
                      type="primary"
                      onClick={() => {
                        setQuestionsData(prev => {
                          const newState = { ...prev };
                          delete newState[currentStep][questionIndex];
                          return newState;
                        });
                      }}
                      className={`${getClassName(user.BrandName)} static button-full-width`}
                      danger
                    >
                      <p style={{ fontSize: 12 }}>{t('cauhoi.Xóa câu hỏi')}</p>
                    </Button>
                  )}
                </Space>
              </div>

              <Form.Item
                label={<span className={getquestion2(user.BrandName)}>{t('cauhoi.Câu hỏi')}</span>}
                name={`question_${questionIndex}`}
                rules={[{ required: true, message: t('cauhoi.Vui lòng nhập câu hỏi') }]}
              >
                <Tabs
                  className={getTabs(user.BrandName)}
                  activeKey={activeTabKey}
                  onChange={setActiveTabKey}
                >
                  <TabPane tab={t('cauhoi.Tiếng Việt')} key="vi">
                    <Input
                      className={getInput(user.BrandName)}
                      value={questionsData[currentStep]?.[questionIndex]?.question?.vi || ''}
                      onChange={e => {
                        const newValue = e.target.value;
                        const currentOptions = questionsData[currentStep]?.[questionIndex]?.options || [];
                        
                        // Kiểm tra trùng lặp
                        const isDuplicate = currentOptions.some((opt, idx) => 
                          idx !== questionIndex && opt.vi === newValue
                        );

                        if (isDuplicate) {
                          message.error(t('cauhoi.Lựa chọn này đã tồn tại'));
                          return;
                        }

                        setQuestionsData(prev => ({
                          ...prev,
                          [currentStep]: {
                            ...prev[currentStep],
                            [questionIndex]: {
                              ...prev[currentStep]?.[questionIndex],
                              question: {
                                ...prev[currentStep]?.[questionIndex]?.question,
                                vi: newValue
                              }
                            }
                          }
                        }));
                        form.setFieldsValue({ [`question_${questionIndex}`]: newValue });
                      }}
                      placeholder={t('cauhoi.Nhập câu hỏi tiếng Việt')}
                    />
                  </TabPane>
                  <TabPane tab={t('cauhoi.Tiếng Anh')} key="en">
                    <Input
                      className={getInput(user.BrandName)}
                      value={questionsData[currentStep]?.[questionIndex]?.question?.en || ''}
                      onChange={e => {
                        const newValue = e.target.value;
                        const currentOptions = questionsData[currentStep]?.[questionIndex]?.options || [];
                        
                        // Kiểm tra trùng lặp
                        const isDuplicate = currentOptions.some((opt, idx) => 
                          idx !== questionIndex && opt.en === newValue
                        );

                        if (isDuplicate) {
                          message.error(t('cauhoi.Lựa chọn này đã tồn tại'));
                          return;
                        }

                        setQuestionsData(prev => ({
                          ...prev,
                          [currentStep]: {
                            ...prev[currentStep],
                            [questionIndex]: {
                              ...prev[currentStep]?.[questionIndex],
                              question: {
                                ...prev[currentStep]?.[questionIndex]?.question,
                                en: newValue
                              }
                            }
                          }
                        }));
                      }}
                      placeholder={t('cauhoi.Nhập câu hỏi tiếng Anh')}
                    />
                  </TabPane>
                  <TabPane tab={t('cauhoi.Tiếng Campuchia')} key="kh">
                    <Input
                      className={getInput(user.BrandName)}
                      value={questionsData[currentStep]?.[questionIndex]?.question?.kh || ''}
                      onChange={e => {
                        const newValue = e.target.value;
                        const currentOptions = questionsData[currentStep]?.[questionIndex]?.options || [];
                        
                        // Kiểm tra trùng lặp
                        const isDuplicate = currentOptions.some((opt, idx) => 
                          idx !== questionIndex && opt.kh === newValue
                        );

                        if (isDuplicate) {
                          message.error(t('cauhoi.Lựa chọn này đã tồn tại'));
                          return;
                        }

                        setQuestionsData(prev => ({
                          ...prev,
                          [currentStep]: {
                            ...prev[currentStep],
                            [questionIndex]: {
                              ...prev[currentStep]?.[questionIndex],
                              question: {
                                ...prev[currentStep]?.[questionIndex]?.question,
                                kh: newValue
                              }
                            }
                          }
                        }));
                      }}
                      placeholder={t('cauhoi.Nhập câu hỏi tiếng Campuchia')}
                    />
                  </TabPane>
                </Tabs>
              </Form.Item>

              <Form.Item
                label={<span className={getquestion2(user.BrandName)}>{t('cauhoi.Loại câu hỏi')}</span>}
                name={`questionType_${questionIndex}`}
                rules={[{ required: true, message: t('cauhoi.Vui lòng chọn loại câu hỏi') }]}
              >
                <Select
                  value={questionsData[currentStep]?.[questionIndex]?.type}
                  placeholder={t('cauhoi.Chọn loại câu hỏi')}
                  onChange={value => {
                    setQuestionsData(prev => ({
                      ...prev,
                      [currentStep]: {
                        ...prev[currentStep],
                        [questionIndex]: {
                          ...prev[currentStep]?.[questionIndex],
                          type: value,
                          dataType: value === 'text' ? 'text' : undefined,
                          options: value === 'rate' ? [{ title: { vi: '', en: '', kh: '' }, content: { vi: '', en: '', kh: '' }, required: false, rate: 0 }] : [{ vi: '', en: '', kh: '' }]
                        }
                      }
                    }));
                    form.setFieldsValue({ [`questionType_${questionIndex}`]: value });
                  }}
                  className={getSelect(user.BrandName)}
                >
                  <Select.Option value="text">{t('cauhoi.Dạng trả lời câu hỏi')}</Select.Option>
                  <Select.Option value="textarea">{t('cauhoi.Dạng trả lời văn bản')}</Select.Option>
                  <Select.Option value="rate">{t('cauhoi.Dạng đánh giá')}</Select.Option>
                  <Select.Option value="choice">{t('cauhoi.Dạng lựa chọn')}</Select.Option>
                </Select>
              </Form.Item>

              {questionsData[currentStep]?.[questionIndex]?.type === 'text' && (
                <Select
                  value={questionsData[currentStep]?.[questionIndex]?.dataType || 'text'}
                  onChange={value => {
                    setQuestionsData(prev => ({
                      ...prev,
                      [currentStep]: {
                        ...prev[currentStep],
                        [questionIndex]: {
                          ...prev[currentStep]?.[questionIndex],
                          dataType: value
                        }
                      }
                    }));
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

              {questionsData[currentStep]?.[questionIndex]?.type === 'rate' && (
                <div>
                  <Form.Item
                    label={<span className={getquestion2(user.BrandName)}>{t('cauhoi.Nội dung mô tả')}</span>}
                    name={`content_${questionIndex}`}
                  >
                    <Tabs
                      className={getTabs(user.BrandName)}
                      activeKey={activeTabKey}
                      onChange={setActiveTabKey}
                    >
                      <TabPane tab={t('cauhoi.Tiếng Việt')} key="vi">
                        <Input.TextArea
                          className={getInput(user.BrandName)}
                          rows={3}
                          placeholder={t('cauhoi.Nhập nội dung mô tả cho câu hỏi đánh giá')}
                          value={questionsData[currentStep]?.[questionIndex]?.content?.vi || ''}
                          onChange={e => {
                            setQuestionsData(prev => ({
                              ...prev,
                              [currentStep]: {
                                ...prev[currentStep],
                                [questionIndex]: {
                                  ...prev[currentStep]?.[questionIndex],
                                  content: {
                                    ...prev[currentStep]?.[questionIndex]?.content,
                                    vi: e.target.value
                                  }
                                }
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
                          value={questionsData[currentStep]?.[questionIndex]?.content?.en || ''}
                          onChange={e => {
                            setQuestionsData(prev => ({
                              ...prev,
                              [currentStep]: {
                                ...prev[currentStep],
                                [questionIndex]: {
                                  ...prev[currentStep]?.[questionIndex],
                                  content: {
                                    ...prev[currentStep]?.[questionIndex]?.content,
                                    en: e.target.value
                                  }
                                }
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
                          value={questionsData[currentStep]?.[questionIndex]?.content?.kh || ''}
                          onChange={e => {
                            setQuestionsData(prev => ({
                              ...prev,
                              [currentStep]: {
                                ...prev[currentStep],
                                [questionIndex]: {
                                  ...prev[currentStep]?.[questionIndex],
                                  content: {
                                    ...prev[currentStep]?.[questionIndex]?.content,
                                    kh: e.target.value
                                  }
                                }
                              }
                            }));
                          }}
                        />
                      </TabPane>
                    </Tabs>
                  </Form.Item>

                  <div>
                    <Divider className={getquestion2(user.BrandName)}>{t('cauhoi.Câu hỏi phụ')}</Divider>
                    {(questionsData[currentStep]?.[questionIndex]?.options || []).map((subQuestion, subIndex) => (
                      <div key={`subq-${subIndex}`} style={{ marginBottom: 16, border: '1px dashed #d9d9d9', padding: 16, borderRadius: 8 }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Form.Item
                            label={<span className={getquestion2(user.BrandName)}>{t('cauhoi.Tiêu đề câu hỏi phụ')} {subIndex + 1}</span>}
                            name={`subQuestionTitle_${questionIndex}_${subIndex}`}
                          >
                            <Tabs
                              className={getTabs(user.BrandName)}
                              activeKey={activeTabKey}
                              onChange={setActiveTabKey}
                            >
                              <TabPane tab={t('cauhoi.Tiếng Việt')} key="vi">
                                <Input
                                  value={subQuestion.title?.vi || ''}
                                  onChange={e => {
                                    const newValue = e.target.value;
                                    const currentOptions = questionsData[currentStep]?.[questionIndex]?.options || [];
                                    
                                    // Kiểm tra trùng lặp
                                    const isDuplicate = currentOptions.some((opt, idx) => 
                                      idx !== subIndex && opt.vi === newValue
                                    );

                                    if (isDuplicate) {
                                      message.error(t('cauhoi.Lựa chọn này đã tồn tại'));
                                      return;
                                    }

                                    setQuestionsData(prev => ({
                                      ...prev,
                                      [currentStep]: {
                                        ...prev[currentStep],
                                        [questionIndex]: {
                                          ...prev[currentStep]?.[questionIndex],
                                          options: prev[currentStep]?.[questionIndex]?.options?.map((q, i) =>
                                            i === subIndex ? {
                                              ...q,
                                              title: {
                                                ...q.title,
                                                vi: newValue
                                              }
                                            } : q
                                          ) || [{
                                            title: { vi: newValue, en: '', kh: '' },
                                            content: { vi: '', en: '', kh: '' },
                                            required: false,
                                            rate: 0
                                          }]
                                        }
                                      }
                                    }));
                                  }}
                                  className={getInput(user.BrandName)}
                                  placeholder={t('cauhoi.Nhập tiêu đề câu hỏi phụ')}
                                />
                              </TabPane>
                              <TabPane tab={t('cauhoi.Tiếng Anh')} key="en">
                                <Input
                                  value={subQuestion.title?.en || ''}
                                  onChange={e => {
                                    const newValue = e.target.value;
                                    const currentOptions = questionsData[currentStep]?.[questionIndex]?.options || [];
                                    
                                    // Kiểm tra trùng lặp
                                    const isDuplicate = currentOptions.some((opt, idx) => 
                                      idx !== subIndex && opt.en === newValue
                                    );

                                    if (isDuplicate) {
                                      message.error(t('cauhoi.Lựa chọn này đã tồn tại'));
                                      return;
                                    }

                                    setQuestionsData(prev => ({
                                      ...prev,
                                      [currentStep]: {
                                        ...prev[currentStep],
                                        [questionIndex]: {
                                          ...prev[currentStep]?.[questionIndex],
                                          options: prev[currentStep]?.[questionIndex]?.options?.map((q, i) =>
                                            i === subIndex ? {
                                              ...q,
                                              title: {
                                                ...q.title,
                                                en: newValue
                                              }
                                            } : q
                                          ) || [{
                                            title: { vi: '', en: newValue, kh: '' },
                                            content: { vi: '', en: '', kh: '' },
                                            required: false,
                                            rate: 0
                                          }]
                                        }
                                      }
                                    }));
                                  }}
                                  className={getInput(user.BrandName)}
                                  placeholder={t('cauhoi.Nhập tiêu đề câu hỏi phụ')}
                                />
                              </TabPane>
                              <TabPane tab={t('cauhoi.Tiếng Campuchia')} key="kh">
                                <Input
                                  value={subQuestion.title?.kh || ''}
                                  onChange={e => {
                                    const newValue = e.target.value;
                                    const currentOptions = questionsData[currentStep]?.[questionIndex]?.options || [];
                                    
                                    // Kiểm tra trùng lặp
                                    const isDuplicate = currentOptions.some((opt, idx) => 
                                      idx !== subIndex && opt.kh === newValue
                                    );

                                    if (isDuplicate) {
                                      message.error(t('cauhoi.Lựa chọn này đã tồn tại'));
                                      return;
                                    }

                                    setQuestionsData(prev => ({
                                      ...prev,
                                      [currentStep]: {
                                        ...prev[currentStep],
                                        [questionIndex]: {
                                          ...prev[currentStep]?.[questionIndex],
                                          options: prev[currentStep]?.[questionIndex]?.options?.map((q, i) =>
                                            i === subIndex ? {
                                              ...q,
                                              title: {
                                                ...q.title,
                                                kh: newValue
                                              }
                                            } : q
                                          ) || [{
                                            title: { vi: '', en: '', kh: newValue },
                                            content: { vi: '', en: '', kh: '' },
                                            required: false,
                                            rate: 0
                                          }]
                                        }
                                      }
                                    }));
                                  }}
                                  className={getInput(user.BrandName)}
                                  placeholder={t('cauhoi.Nhập tiêu đề câu hỏi phụ')}
                                />
                              </TabPane>
                            </Tabs>
                          </Form.Item>

                          <Form.Item
                            label={<span className={getquestion2(user.BrandName)}>{t('cauhoi.Nội dung câu hỏi phụ')} {subIndex + 1}</span>}
                            name={`subQuestionContent_${questionIndex}_${subIndex}`}
                          >
                            <Tabs
                              className={getTabs(user.BrandName)}
                              activeKey={activeTabKey}
                              onChange={setActiveTabKey}
                            >
                              <TabPane tab={t('cauhoi.Tiếng Việt')} key="vi">
                                <Input.TextArea
                                  value={subQuestion.content?.vi || ''}
                                  onChange={e => {
                                    const newValue = e.target.value;
                                    const currentOptions = questionsData[currentStep]?.[questionIndex]?.options || [];
                                    
                                    // Kiểm tra trùng lặp
                                    const isDuplicate = currentOptions.some((opt, idx) => 
                                      idx !== subIndex && opt.vi === newValue
                                    );

                                    if (isDuplicate) {
                                      message.error(t('cauhoi.Lựa chọn này đã tồn tại'));
                                      return;
                                    }

                                    setQuestionsData(prev => ({
                                      ...prev,
                                      [currentStep]: {
                                        ...prev[currentStep],
                                        [questionIndex]: {
                                          ...prev[currentStep]?.[questionIndex],
                                          options: prev[currentStep]?.[questionIndex]?.options?.map((q, i) =>
                                            i === subIndex ? {
                                              ...q,
                                              content: {
                                                ...q.content,
                                                vi: newValue
                                              }
                                            } : q
                                          ) || [{
                                            title: { vi: '', en: '', kh: '' },
                                            content: { vi: newValue, en: '', kh: '' },
                                            required: false,
                                            rate: 0
                                          }]
                                        }
                                      }
                                    }));
                                  }}
                                  className={getInput(user.BrandName)}
                                  rows={2}
                                  placeholder={t('cauhoi.Nhập nội dung câu hỏi phụ')}
                                />
                              </TabPane>
                              <TabPane tab={t('cauhoi.Tiếng Anh')} key="en">
                                <Input.TextArea
                                  value={subQuestion.content?.en || ''}
                                  onChange={e => {
                                    const newValue = e.target.value;
                                    const currentOptions = questionsData[currentStep]?.[questionIndex]?.options || [];
                                    
                                    // Kiểm tra trùng lặp
                                    const isDuplicate = currentOptions.some((opt, idx) => 
                                      idx !== subIndex && opt.en === newValue
                                    );

                                    if (isDuplicate) {
                                      message.error(t('cauhoi.Lựa chọn này đã tồn tại'));
                                      return;
                                    }

                                    setQuestionsData(prev => ({
                                      ...prev,
                                      [currentStep]: {
                                        ...prev[currentStep],
                                        [questionIndex]: {
                                          ...prev[currentStep]?.[questionIndex],
                                          options: prev[currentStep]?.[questionIndex]?.options?.map((q, i) =>
                                            i === subIndex ? {
                                              ...q,
                                              content: {
                                                ...q.content,
                                                en: newValue
                                              }
                                            } : q
                                          ) || [{
                                            title: { vi: '', en: '', kh: '' },
                                            content: { vi: '', en: newValue, kh: '' },
                                            required: false,
                                            rate: 0
                                          }]
                                        }
                                      }
                                    }));
                                  }}
                                  className={getInput(user.BrandName)}
                                  rows={2}
                                  placeholder={t('cauhoi.Nhập nội dung câu hỏi phụ')}
                                />
                              </TabPane>
                              <TabPane tab={t('cauhoi.Tiếng Campuchia')} key="kh">
                                <Input.TextArea
                                  value={subQuestion.content?.kh || ''}
                                  onChange={e => {
                                    const newValue = e.target.value;
                                    const currentOptions = questionsData[currentStep]?.[questionIndex]?.options || [];
                                    
                                    // Kiểm tra trùng lặp
                                    const isDuplicate = currentOptions.some((opt, idx) => 
                                      idx !== subIndex && opt.kh === newValue
                                    );

                                    if (isDuplicate) {
                                      message.error(t('cauhoi.Lựa chọn này đã tồn tại'));
                                      return;
                                    }

                                    setQuestionsData(prev => ({
                                      ...prev,
                                      [currentStep]: {
                                        ...prev[currentStep],
                                        [questionIndex]: {
                                          ...prev[currentStep]?.[questionIndex],
                                          options: prev[currentStep]?.[questionIndex]?.options?.map((q, i) =>
                                            i === subIndex ? {
                                              ...q,
                                              content: {
                                                ...q.content,
                                                kh: newValue
                                              }
                                            } : q
                                          ) || [{
                                            title: { vi: '', en: '', kh: '' },
                                            content: { vi: '', en: '', kh: newValue },
                                            required: false,
                                            rate: 0
                                          }]
                                        }
                                      }
                                    }));
                                  }}
                                  className={getInput(user.BrandName)}
                                  rows={2}
                                  placeholder={t('cauhoi.Nhập nội dung câu hỏi phụ')}
                                />
                              </TabPane>
                            </Tabs>
                          </Form.Item>

                          <Form.Item label={<span className={getquestion2(user.BrandName)}>Đánh giá mẫu</span>}>
                            <Rate
                              value={subQuestion.rate}
                              onChange={value => {
                                setQuestionsData(prev => ({
                                  ...prev,
                                  [currentStep]: {
                                    ...prev[currentStep],
                                    [questionIndex]: {
                                      ...prev[currentStep]?.[questionIndex],
                                      options: prev[currentStep]?.[questionIndex]?.options?.map((q, i) =>
                                        i === subIndex ? {
                                          ...q,
                                          rate: value
                                        } : q
                                      ) || [{
                                        title: { vi: '', en: '', kh: '' },
                                        content: { vi: '', en: '', kh: '' },
                                        required: false,
                                        rate: value
                                      }]
                                    }
                                  }
                                }));
                              }}
                              className={getRate(user.BrandName)}
                            />
                          </Form.Item>

                          {subIndex > 0 && (
                            <Space>
                              <Button
                                type="primary"
                                className={`${getClassName(user.BrandName)} static button-full-width`}
                                onClick={() => {
                                  setQuestionsData(prev => ({
                                    ...prev,
                                    [currentStep]: {
                                      ...prev[currentStep],
                                      [questionIndex]: {
                                        ...prev[currentStep]?.[questionIndex],
                                        options: prev[currentStep]?.[questionIndex]?.options?.filter((_, i) => i !== subIndex)
                                      }
                                    }
                                  }));
                                }}
                                icon={<DeleteOutlined />}
                              >
                                <p style={{ fontSize: '12px' }}>{t('cauhoi.Xóa câu hỏi phụ này')}</p>
                              </Button>
                            </Space>
                          )}
                        </Space>
                      </div>
                    ))}

                    {(questionsData[currentStep]?.[questionIndex]?.options?.length || 0) < 4 && (
                      <Button
                        type="primary"
                        className={`${getClassName(user.BrandName)} static button-full-width`}
                        onClick={() => {
                          setQuestionsData(prev => ({
                            ...prev,
                            [currentStep]: {
                              ...prev[currentStep],
                              [questionIndex]: {
                                ...prev[currentStep]?.[questionIndex],
                                options: [
                                  ...(prev[currentStep]?.[questionIndex]?.options || []),
                                  {
                                    title: { vi: '', en: '', kh: '' },
                                    content: { vi: '', en: '', kh: '' },
                                    required: false,
                                    rate: 0
                                  }
                                ]
                              }
                            }
                          }));
                        }}
                        block
                        icon={<PlusOutlined />}
                        style={{ marginTop: 16, marginBottom: 16 }}
                      >
                        <p style={{ fontSize: 12 }}>{t('cauhoi.Thêm câu hỏi phụ')}</p>
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {questionsData[currentStep]?.[questionIndex]?.type === 'choice' && (
                <div>
                  <Form.Item
                    label={<span className={getquestion2(user.BrandName)}>{t('cauhoi.Nội dung mô tả')}</span>}
                    name={`content_${questionIndex}`}
                  >
                    <Tabs
                      className={getTabs(user.BrandName)}
                      activeKey={activeTabKey}
                      onChange={setActiveTabKey}
                    >
                      <TabPane tab={t('cauhoi.Tiếng Việt')} key="vi">
                        <Input.TextArea
                          className={getInput(user.BrandName)}
                          rows={3}
                          placeholder={t('cauhoi.Nhập nội dung mô tả cho câu hỏi')}
                          value={questionsData[currentStep]?.[questionIndex]?.content?.vi || ''}
                          onChange={e => {
                            setQuestionsData(prev => ({
                              ...prev,
                              [currentStep]: {
                                ...prev[currentStep],
                                [questionIndex]: {
                                  ...prev[currentStep]?.[questionIndex],
                                  content: {
                                    ...prev[currentStep]?.[questionIndex]?.content,
                                    vi: e.target.value
                                  }
                                }
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
                          value={questionsData[currentStep]?.[questionIndex]?.content?.en || ''}
                          onChange={e => {
                            setQuestionsData(prev => ({
                              ...prev,
                              [currentStep]: {
                                ...prev[currentStep],
                                [questionIndex]: {
                                  ...prev[currentStep]?.[questionIndex],
                                  content: {
                                    ...prev[currentStep]?.[questionIndex]?.content,
                                    en: e.target.value
                                  }
                                }
                              }
                            }));
                          }}
                        />
                      </TabPane>
                      <TabPane tab={t('cauhoi.Tiếng Campuchia')} key="kh">
                        <Input.TextArea
                          className={getInput(user.BrandName)}
                          rows={3}
                          placeholder={t('cauhoi.Nhập LENdung mô tả cho câu hỏi')}
                          value={questionsData[currentStep]?.[questionIndex]?.content?.kh || ''}
                          onChange={e => {
                            setQuestionsData(prev => ({
                              ...prev,
                              [currentStep]: {
                                ...prev[currentStep],
                                [questionIndex]: {
                                  ...prev[currentStep]?.[questionIndex],
                                  content: {
                                    ...prev[currentStep]?.[questionIndex]?.content,
                                    kh: e.target.value
                                  }
                                }
                              }
                            }));
                          }}
                        />
                      </TabPane>
                    </Tabs>
                  </Form.Item>

                  {(questionsData[currentStep]?.[questionIndex]?.options || []).map((option, optionIndex) => (
                    <Form.Item
                      label={<span className={getquestion2(user.BrandName)}>{t('cauhoi.Lựa chọn')} {optionIndex + 1}</span>}
                      name={`option_${questionIndex}_${optionIndex}`}
                      key={optionIndex}
                      rules={[{ required: true, message: t('cauhoi.Vui lòng nhập lựa chọn') }]}
                    >
                      <Tabs
                        className={getTabs(user.BrandName)}
                        activeKey={activeTabKey}
                        onChange={setActiveTabKey}
                      >
                        <TabPane tab={t('cauhoi.Tiếng Việt')} key="vi">
                          <Input
                            value={option.vi || ''}
                            onChange={e => {
                              const newValue = e.target.value;
                              const currentOptions = questionsData[currentStep]?.[questionIndex]?.options || [];
                              
                              // Kiểm tra trùng lặp
                              const isDuplicate = currentOptions.some((opt, idx) => 
                                idx !== optionIndex && opt.vi === newValue
                              );

                              if (isDuplicate) {
                                message.error(t('cauhoi.Lựa chọn này đã tồn tại'));
                                return;
                              }

                              setQuestionsData(prev => ({
                                ...prev,
                                [currentStep]: {
                                  ...prev[currentStep],
                                  [questionIndex]: {
                                    ...prev[currentStep]?.[questionIndex],
                                    options: prev[currentStep]?.[questionIndex]?.options?.map((opt, i) =>
                                      i === optionIndex ? {
                                        ...opt,
                                        vi: newValue
                                      } : opt
                                    ) || [{ vi: newValue, en: '', kh: '' }]
                                  }
                                }
                              }));
                            }}
                            className={getInput(user.BrandName)}
                            placeholder={`${t('cauhoi.Nội dung lựa chọn')} ${optionIndex + 1}`}
                          />
                        </TabPane>
                        <TabPane tab={t('cauhoi.Tiếng Anh')} key="en">
                          <Input
                            value={option.en || ''}
                            onChange={e => {
                              const newValue = e.target.value;
                              const currentOptions = questionsData[currentStep]?.[questionIndex]?.options || [];
                              
                              // Kiểm tra trùng lặp
                              const isDuplicate = currentOptions.some((opt, idx) => 
                                idx !== optionIndex && opt.en === newValue
                              );

                              if (isDuplicate) {
                                message.error(t('cauhoi.Lựa chọn này đã tồn tại'));
                                return;
                              }

                              setQuestionsData(prev => ({
                                ...prev,
                                [currentStep]: {
                                  ...prev[currentStep],
                                  [questionIndex]: {
                                    ...prev[currentStep]?.[questionIndex],
                                    options: prev[currentStep]?.[questionIndex]?.options?.map((opt, i) =>
                                      i === optionIndex ? {
                                        ...opt,
                                        en: newValue
                                      } : opt
                                    ) || [{ vi: '', en: newValue, kh: '' }]
                                  }
                                }
                              }));
                            }}
                            className={getInput(user.BrandName)}
                            placeholder={`${t('cauhoi.Nội dung lựa chọn')} ${optionIndex + 1}`}
                          />
                        </TabPane>
                        <TabPane tab={t('cauhoi.Tiếng Campuchia')} key="kh">
                          <Input
                            value={option.kh || ''}
                            onChange={e => {
                              const newValue = e.target.value;
                              const currentOptions = questionsData[currentStep]?.[questionIndex]?.options || [];
                              
                              // Kiểm tra trùng lặp
                              const isDuplicate = currentOptions.some((opt, idx) => 
                                idx !== optionIndex && opt.kh === newValue
                              );

                              if (isDuplicate) {
                                message.error(t('cauhoi.Lựa chọn này đã tồn tại'));
                                return;
                              }

                              setQuestionsData(prev => ({
                                ...prev,
                                [currentStep]: {
                                  ...prev[currentStep],
                                  [questionIndex]: {
                                    ...prev[currentStep]?.[questionIndex],
                                    options: prev[currentStep]?.[questionIndex]?.options?.map((opt, i) =>
                                      i === optionIndex ? {
                                        ...opt,
                                        kh: newValue
                                      } : opt
                                    ) || [{ vi: '', en: '', kh: newValue }]
                                  }
                                }
                              }));
                            }}
                            className={getInput(user.BrandName)}
                            placeholder={`${t('cauhoi.Nội dung lựa chọn')} ${optionIndex + 1}`}
                          />
                        </TabPane>
                      </Tabs>
                      {optionIndex > 0 && (
                        <Button
                          onClick={() => {
                            setQuestionsData(prev => ({
                              ...prev,
                              [currentStep]: {
                                ...prev[currentStep],
                                [questionIndex]: {
                                  ...prev[currentStep]?.[questionIndex],
                                  options: prev[currentStep]?.[questionIndex]?.options?.filter((_, i) => i !== optionIndex)
                                }
                              }
                            }));
                          }}
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
                    onClick={() => {
                      setQuestionsData(prev => ({
                        ...prev,
                        [currentStep]: {
                          ...prev[currentStep],
                          [questionIndex]: {
                            ...prev[currentStep]?.[questionIndex],
                            options: [
                              ...(prev[currentStep]?.[questionIndex]?.options || []),
                              { vi: '', en: '', kh: '' }
                            ]
                          }
                        }
                      }));
                    }}
                    className={`${getClassName(user.BrandName)} static button-full-width`}
                    style={{ marginBottom: 16 }}
                  >
                    <p style={{ fontSize: 12 }}>{t('cauhoi.Thêm lựa chọn')}</p>
                  </Button>
                </div>
              )}

              {(questionsData[currentStep]?.[questionIndex]?.type === 'text' || questionsData[currentStep]?.[questionIndex]?.type === 'textarea') && (
                <Form.Item
                  label={<span className={getquestion2(user.BrandName)}>Placeholder</span>}
                  name={`placeholder_${questionIndex}`}
                >
                  <Tabs
                    className={getTabs(user.BrandName)}
                    activeKey={activeTabKey}
                    onChange={setActiveTabKey}
                  >
                    <TabPane tab={t('cauhoi.Tiếng Việt')} key="vi">
                      <Input.TextArea
                        placeholder={t('cauhoi.Nhập nội dung cho trường nhập liệu')}
                        className={getInput(user.BrandName)}
                        value={questionsData[currentStep]?.[questionIndex]?.placeholder?.vi || ''}
                        onChange={e => {
                          setQuestionsData(prev => ({
                            ...prev,
                            [currentStep]: {
                              ...prev[currentStep],
                              [questionIndex]: {
                                ...prev[currentStep]?.[questionIndex],
                                placeholder: {
                                  ...prev[currentStep]?.[questionIndex]?.placeholder,
                                  vi: e.target.value
                                }
                              }
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
                        value={questionsData[currentStep]?.[questionIndex]?.placeholder?.en || ''}
                        onChange={e => {
                          setQuestionsData(prev => ({
                            ...prev,
                            [currentStep]: {
                              ...prev[currentStep],
                              [questionIndex]: {
                                ...prev[currentStep]?.[questionIndex],
                                placeholder: {
                                  ...prev[currentStep]?.[questionIndex]?.placeholder,
                                  en: e.target.value
                                }
                              }
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
                        value={questionsData[currentStep]?.[questionIndex]?.placeholder?.kh || ''}
                        onChange={e => {
                          setQuestionsData(prev => ({
                            ...prev,
                            [currentStep]: {
                              ...prev[currentStep],
                              [questionIndex]: {
                                ...prev[currentStep]?.[questionIndex],
                                placeholder: {
                                  ...prev[currentStep]?.[questionIndex]?.placeholder,
                                  kh: e.target.value
                                }
                              }
                            }
                          }));
                        }}
                        rows={4}
                      />
                    </TabPane>
                  </Tabs>
                </Form.Item>
              )}

              <Form.Item>
                <Checkbox
                  checked={questionsData[currentStep]?.[questionIndex]?.required || false}
                  onChange={e => {
                    setQuestionsData(prev => ({
                      ...prev,
                      [currentStep]: {
                        ...prev[currentStep],
                        [questionIndex]: {
                          ...prev[currentStep]?.[questionIndex],
                          required: e.target.checked
                        }
                      }
                    }));
                  }}
                  className='checkboxniso'
                >
                  <p className={getquestion2(user.BrandName)}>{t('cauhoi.Câu hỏi bắt buộc')}</p>
                </Checkbox>
              </Form.Item>
            </div>
          ))}

          {!hideControls && (
            <Button
              type="primary"
              onClick={handleAddQuestionToStep}
              className={`${getClassName(user.BrandName)} static button-full-width`}
              icon={<PlusOutlined />}
              block
            >
              <p style={{ fontSize: 12 }}>{t('cauhoi.Tạo câu hỏi')}</p>
            </Button>
          )}

          <div style={{ marginTop: 16, marginBottom: 16, display: hideControls ? 'none' : 'block' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Form.Item style={{ marginBottom: 0, textAlign: 'left' }}>
                <Space wrap>
                  <Input
                    type="number"
                    min={1}
                    max={totalSteps}
                    style={{ width: 120 }}
                    placeholder={t('cauhoi.Nhập số step')}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value >= 1 && value <= totalSteps) {
                        setCurrentStep(value);
                      }
                    }}
                    className={getInput(user.BrandName)}
                  />
                  <Button
                    type="primary"
                    onClick={() => {
                      const input = document.querySelector('input[type="number"]');
                      const value = parseInt(input.value);
                      if (value >= 1 && value <= totalSteps) {
                        setCurrentStep(value);
                      } else {
                        message.error(t('cauhoi.Vui lòng nhập số step hợp lệ'));
                      }
                    }}
                    className={`${getClassName(user.BrandName)} static button-full-width`}
                  >
                    <p style={{ fontSize: 12 }}>{t('cauhoi.Chuyển đến')}</p>
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => setShowCopyModal(true)}
                    className={`${getClassName(user.BrandName)} static button-full-width`}
                  >
                    <p style={{ fontSize: 12 }}>{t('cauhoi.Sao chép')}</p>
                  </Button>
                  {totalSteps > 1 && (
                    <Button
                      type="primary"
                      danger
                      onClick={handleDeleteStep}
                      className={`${getClassName(user.BrandName)} static button-full-width`}
                    >
                      <p style={{ fontSize: 12 }}>{t('cauhoi.Xóa step')}</p>
                    </Button>
                  )}
                </Space>
              </Form.Item>

            <div style={{ textAlign: 'right' }}>
              <Space>
                {currentStep > 1 && (
                  <Button
                    type="primary"
                    onClick={handlePrevStep}
                    className={`${getClassName(user.BrandName)} static button-full-width`}
                  >
                    <p style={{ fontSize: 12 }}>{t('cauhoi.Previous')}</p>
                  </Button>
                )}
                {currentStep < 10 && (
                  <Button
                    type="primary"
                    onClick={handleNextStep}
                    className={`${getClassName(user.BrandName)} static button-full-width`}
                  >
                    <p style={{ fontSize: 12 }}>{t('cauhoi.Next')}</p>
                  </Button>
                )}
              </Space>
            </div>
          </Space>
        </div>
      </Form>
    </Drawer>

    <CopyStepModal
      visible={showCopyModal}
      onClose={() => setShowCopyModal(false)}
      currentStep={currentStep}
      user={user}
      t={t}
      onSuccess={handleCopySuccess}
      currentForm={editingForm}
    />
  </>
);
};

export default memo(FormStorageModal);