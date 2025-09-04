import React, { useState, useEffect, useCallback } from 'react';
import { Form, Button, message, Space, Layout, Modal, Mentions, Select, Progress } from 'antd';
import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import moment from 'moment';
import axios from 'axios';
import GoodyLogo from '../asset/Goody.svg';
import RunamDorLogo from '../asset/RUNAMDOR.svg';
import RunamLogo from '../asset/RUNAM.svg';
import CiaoLogo from '../asset/Ciao.svg';
import ThanhnienLogo from '../asset/Thanh_nien.svg';
import { MenuFoldOutlined, EditOutlined, RightOutlined, LeftOutlined, PlusOutlined } from '@ant-design/icons';
import Language from './Language';
import SecondForm from './form/SecondForm';
import CustomQuestionModal from './form/CustomQuestionModal';
import FormStorageModal from './form/FormStorageModal';
import CustomQuestion from './form/CustomQuestion';
import LogoLoad from './LoadLogo';
import NisoFooter from '../asset/ALL.png';
import ThankYou from './ThankYou';
import NisoLogo from '../asset/Logo.svg';
import { geth1, getLogo, getModal, getInput, getquestion, getRate, getColorRate, getCheckbox, getClassName, getSelect } from './form/Custom';

const { Content } = Layout;

const Home = ({ handleLogout, t }) => {
  const user = useOutletContext();
  const [titles, setTitles] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const Dates = moment().format('DD-MM-YYYY HH:mm:ss');
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [firstFormValues, setFirstFormValues] = useState({});
  const [exitCountdown, setExitCountdown] = useState(5);
  const [showThankYou, setShowThankYou] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStates, setEditingStates] = useState({});
  const [selectedBrand, setSelectedBrand] = useState(user.BrandName);
  const [showCustomQuestionForm, setShowCustomQuestionForm] = useState(false);
  const [questionType, setQuestionType] = useState('');
  const [customQuestion, setCustomQuestion] = useState('');
  const [rateOptions, setRateOptions] = useState(['', '', '', '']);
  const [answerOptions, setAnswerOptions] = useState(['']);
  const [isRequired, setIsRequired] = useState(false);
  const [customQuestions, setCustomQuestions] = useState([]);
  const [dataType, setDataType] = useState('text');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [placeholder, setPlaceholder] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps, setTotalSteps] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStep, setSelectedStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isDataReady, setIsDataReady] = useState(false);
  const navigate = useNavigate();
  const [isEditingThankYou, setIsEditingThankYou] = useState(false);
  const [thankYouData, setThankYouData] = useState(null);
  const [subQuestions, setSubQuestions] = useState([{ title: '', content: '', rate: 0 }]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [resCodes, setResCodes] = useState([]);
  const [selectedResCode, setSelectedResCode] = useState('');
  const [showFormStorageModal, setShowFormStorageModal] = useState(false);
  const [editingForm, setEditingForm] = useState(null);
  const [isFromStorage, setIsFromStorage] = useState(false);
  const [hideControls, setHideControls] = useState(false);
  const [isLogoLoaded, setIsLogoLoaded] = useState(false);
  const [isFooterLoaded, setIsFooterLoaded] = useState(false);

  const fetchQuestions = useCallback(async () => {
    try {
      const response = await axios.get('/question/all', {
        headers: {
          'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
        },
        params: {
          brandName: user.BrandName
        }
      });

      if (response.data.success) {
        if (response.data.fromStorage) {
          const storageQuestions = Array.isArray(response.data.questions) ? response.data.questions.map(q => ({ ...q, fromStorage: true, formId: response.data.id })) : [];
          setCustomQuestions(storageQuestions);
          setTitles([{
            id: 'storage',
            ...response.data,
            formName: response.data.formName || { vi: '', en: '', kh: '' }
          }]);
          setCurrentItem({
            id: 'storage',
            ...response.data,
            formName: response.data.formName || { vi: '', en: '', kh: '' }
          });

          const maxStep = storageQuestions.length > 0
            ? Math.max(...storageQuestions.map(q => q.step || 1))
            : 1;
          setTotalSteps(maxStep);
          setCurrentStep(1);
        } else {
          const questions = Array.isArray(response.data.questions) ? response.data.questions.map(q => ({ ...q, fromStorage: false })) : [];
          const brandQuestions = questions.filter(q => q.BrandName === user.BrandName);
          setCustomQuestions(brandQuestions);
          setTitles(questions);
          if (questions.length > 0) {
            setCurrentItem(questions[0]);
          }

          const maxStep = brandQuestions.length > 0
            ? Math.max(...brandQuestions.map(q => q.step || 1))
            : 1;
          setTotalSteps(maxStep);
          setCurrentStep(1);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Lỗi khi tải câu hỏi:', error);
      message.error('Không thể tải câu hỏi');
      return false;
    }
  }, [user.BrandName]);

  const fetchForms = useCallback(async () => {
    try {
      const response = await axios.get('/question/storage/list', {
        headers: {
          'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
        }
      });
      if (response.data.success) {
        return response.data.forms;
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách form:', error);
      message.error(error.message || t('cauhoi.Có lỗi xảy ra'));
    }
  }, [t]);

  useEffect(() => {
    if (Array.isArray(titles) && titles.length > 0) {
      setCurrentItem(titles[0]);
      setCurrentIndex(0);
      setIsFromStorage(titles[0]?.fromStorage || false);
    }
  }, [titles]);

  useEffect(() => {
    const loadData = async () => {
      setLoadingProgress(0);
      setIsLoading(true);
      setIsDataReady(false);

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

        const apiSuccess = await fetchQuestions();

        clearInterval(progressInterval);
        setLoadingProgress(100);

        if (apiSuccess) {
          await new Promise(resolve => setTimeout(resolve, 500));
          setIsDataReady(true);
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        message.error('Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 200);
      }
    };

    loadData();

    return () => {
      setIsLoading(false);
      setLoadingProgress(0);
      setIsDataReady(false);
    };
  }, [fetchQuestions]);

  const resetForm = useCallback(() => {
    form.resetFields();
    setShowThankYou(false);
    setCurrentStep(1);
    setFirstFormValues({});
  }, [form]);

  const startExitCountdown = useCallback(() => {
    setExitCountdown(prev => {
      if (prev <= 1) {
        resetForm();
        return 5;
      }
      return prev - 1;
    });
  }, [resetForm]);

  const onSecondFormFinish = useCallback(async (values, item) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitting(true);

    try {
      const allBrandQuestions = customQuestions.filter(q => q.BrandName === user.BrandName);

      if (!allBrandQuestions.length) {
        throw new Error('Không có câu hỏi nào cho brand này');
      }

      const cssItems = allBrandQuestions.map(question => {
        if (question.type === 'rate') {
          const ratings = values[question.id] || Array(question.options.length).fill(0);
          return question.options.map((option, index) => ({
            Question: getLocalizedText(option.title || option.question) ||
              (typeof question.question === 'object' ? question.question.vi : question.question),
            Replly: ratings[index] || 0
          }));
        }
        return {
          Question: typeof question.question === 'object' ? question.question.vi : question.question,
          Replly: values[question.id] || (question.type === 'choice' ? '' : question.type === 'rate' ? 0 : '')
        };
      }).flat();

      const cssPayload = {
        Fullname: user.Fullname || null,
        BrandName: user.BrandName || null,
        Date: Dates,
        items: cssItems,
        ResCode: user.ResCode || null,
        ...(isFromStorage && currentItem?.formName?.vi ? { FormName: currentItem.formName.vi } : { FormName: null })
      };

      const viewsItems = allBrandQuestions.map(question => {
        const questionCopy = { ...question };
        if (question.type === 'rate') {
          const ratings = values[question.id] || Array(question.options.length).fill(0);
          questionCopy.dapan = ratings;
        } else {
          questionCopy.dapan = values[question.id] || '';
        }
        delete questionCopy._id;
        delete questionCopy.updatedAt;
        delete questionCopy.createdAt;
        return questionCopy;
      });

      const ratings = viewsItems
        .filter(item => item.type === 'rate' && Array.isArray(item.dapan))
        .flatMap(item => item.dapan)
        .filter(r => r > 0);
      const averageRating = ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1) : 0;

      const safeItem = item || titles[0] || {};

      const brandName = user.BrandName || 'Unknown';

      const getBrandField = (field) => {
        if (!safeItem || !safeItem[field] || !Array.isArray(safeItem[field])) {
          console.warn(`Field ${field} not found or not an array in safeItem:`, safeItem);
          return '';
        }
        const brandData = safeItem[field].find(data => data.brand === brandName);
        if (!brandData) {
          console.warn(`No data found for brand ${brandName} in field ${field}:`, safeItem[field]);
          return '';
        }
        const currentLang = localStorage.getItem('selectedLanguage') || 'vi';
        if (typeof brandData[field] === 'string') {
          return brandData[field];
        }
        if (typeof brandData[field] === 'object') {
          return brandData[field][currentLang] || brandData[field].vi || '';
        }
        return '';
      };

      const titleFields = {
        TieuDe: getBrandField('TieuDe'),
        Title: getBrandField('Title'),
        qt1: getBrandField('qt1'),
        qt2: getBrandField('qt2')
      };

      const viewsPayload = {
        userId: user.userId || localStorage.getItem('userId') || `anonymous-${Date.now()}`,
        brandName: brandName,
        rating: parseFloat(averageRating) || 0,
        Fullname: user.Fullname || 'Anonymous',
        Date: Dates || moment().format('DD-MM-YYYY HH:mm:ss'),
        items: viewsItems,
        ResCode: user.ResCode || '',
        TieuDe: titleFields.TieuDe,
        Title: titleFields.Title,
        qt1: titleFields.qt1,
        qt2: titleFields.qt2
      };

      const cssResponse = await axios.post('/css/add', cssPayload, {
        headers: {
          'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
        }
      });

      const viewsResponse = await axios.post('/views/add', viewsPayload, {
        headers: {
          'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
        }
      });

      if (cssResponse.data && cssResponse.data.success && viewsResponse.data && viewsResponse.data.success) {
        const thankYouResponse = await axios.get(`/question/thankyou?brand=${user.BrandName || 'Unknown'}`, {
          headers: {
            'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
          }
        });

        if (thankYouResponse.data) {
          setThankYouData({
            thankYouText: thankYouResponse.data.thankYouText || '',
            contentText: thankYouResponse.data.contentText || ''
          });
          setCurrentStep(1);
          setShowThankYou(true);
          startExitCountdown();
        }
      } else {
        throw new Error('One or both submissions failed');
      }
    } catch (error) {
      console.error('Lỗi khi submit:', error);
      message.error(`Có lỗi xảy ra khi gửi form: ${error.response?.data?.message || error.message}`);
    } finally {
      setSubmitting(false);
      setTimeout(() => {
        setIsSubmitting(false);
      }, 1000);
    }
  }, [isSubmitting, customQuestions, user, Dates, startExitCountdown, titles, isFromStorage, currentItem]);

  const getLocalizedText = (text) => {
    if (!text) return '';
    if (typeof text === 'object') {
      const currentLang = localStorage.getItem('selectedLanguage') || 'vi';
      return text[currentLang] || text.vi || '';
    }
    return text;
  };

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const unansweredQuestions = customQuestions
        .filter(q => q.required && !values[q.id] && q.step === currentStep);

      if (unansweredQuestions.length > 0) {
        message.error('Vui lòng trả lời tất cả các câu hỏi bắt buộc');
        setSubmitting(false);
        return;
      }

      if (currentStep < totalSteps) {
        setCurrentStep(prev => prev + 1);
        setFirstFormValues({ ...firstFormValues, ...values });
      } else {
        await onSecondFormFinish({ ...firstFormValues, ...values });
      }
    } catch (error) {
      console.error('Lỗi khi xử lý form:', error);
      message.error('Có lỗi xảy ra khi xử lý form');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelExit = useCallback(() => {
    resetForm();
    navigate('/home');
  }, [resetForm, navigate]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleEditableChange = async (field, data, item) => {
    try {
      if (!item || !item[field] || !Array.isArray(item[field])) {
        console.error('Cấu trúc dữ liệu không hợp lệ');
        throw new Error('Dữ liệu không hợp lệ');
      }

      const brandId = `${field}_${user.BrandName.toLowerCase().replace(/\s+/g, '')}`;

      const isBasicField = ['TieuDe', 'Title', 'qt1', 'qt2'].includes(field);

      const requestData = {
        id: item.id,
        BrandName: user.BrandName,
        field: field,
        value: data,
        itemId: item.id,
        brandId: brandId,
        isBasicField: isBasicField
      };

      const response = await axios.put(
        `/question/edit/${item.id}`,
        requestData,
        {
          headers: {
            'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response || !response.data) {
        throw new Error('Phản hồi không hợp lệ từ server');
      }

      const brandIndex = item[field].findIndex(b => b.brand === user.BrandName);
      if (brandIndex !== -1) {
        item[field][brandIndex] = {
          id: brandId,
          brand: user.BrandName,
          [field]: data
        };
      } else {
        item[field].push({
          id: brandId,
          brand: user.BrandName,
          [field]: data
        });
      }

      return response;
    } catch (error) {
      console.error('API Error:', error);
      console.error('Error details:', { item, field, data });
      throw error;
    }
  };

  const handleEditingState = (field, index, value) => {
    setEditingStates(prev => ({
      ...prev,
      [`${field}_${index}`]: value
    }));
  };

  const getEditingState = (field, index) => {
    return editingStates[`${field}_${index}`];
  };

  const processText = (text, key) => {
    if (!text) return '';

    let result = String(text);
    const viEnKhRegex = /vi-en-kh/g;
    result = result.replace(viEnKhRegex, () => key);
    const brandNameRegex = /BrandName/g;
    result = result.replace(brandNameRegex, user.BrandName);
    return result;
  };

  const EditableField = ({
    value,
    field,
    index,
    onSave,
    translationKey,
    style = {}
  }) => {
    const isEditing = getEditingState(field, index);

    if (isEditing) {
      return (
        <Mentions
          className="editable-cell-value-wrap"
          style={{ ...style }}
          autoSize={{ maxRows: 3, minRows: 1 }}
          defaultValue={value}
          onChange={(value) => {
            const cleanedValue = value.replace(/@(\w+)/g, '$1');
            onSave(index, field, cleanedValue);
          }}
          onPressEnter={() => {
            const cleanedValue = value.replace(/@(\w+)/g, '$1');
            onSave(index, field, cleanedValue);
            handleEditingState(field, index, false);
          }}
          prefix={['@']}
        >
          <Mentions.Option value="BrandName">Hiển thị tên thương hiệu</Mentions.Option>
          <Mentions.Option value="vi-en-kh">Thay đổi ngôn ngữ</Mentions.Option>
          {user.PhanQuyen && user.BrandName === 'Goody' && (
            <Mentions.Option value="additionalQuestion">Câu hỏi thêm cho Goody</Mentions.Option>
          )}
          {user.PhanQuyen && user.BrandName === 'Ciao Cafe' && (
            <Mentions.Option value="additionalQuestion">Câu hỏi thêm cho Ciao Cafe</Mentions.Option>
          )}
        </Mentions>
      );
    }

    return (
      <>
        {processText(value, translationKey)}
        {user.PhanQuyen && (
          <Button
            type="text"
            icon={<EditOutlined style={{ color: 'var(--border-main)' }} />}
            onClick={() => handleEditingState(field, index, true)}
          />
        )}
      </>
    );
  };

  const colorsCiaoCafe = ['rgb(245, 171, 33)', 'rgb(230, 19, 137)', 'rgb(5, 164, 77)', 'rgb(144, 43, 138)'];
  const colorGoody = 'rgb(111, 112, 114)';
  const colornhtn = 'rgb(35, 32, 32)';

  const applyColors = (text, colors) => {
    return text.split('').map((char, index) => (
      <span key={index} style={{ color: Array.isArray(colors) ? colors[index % colors.length] : colors }}>{char}</span>
    ));
  };

  const handleBrandChange = (newBrandName) => {
    setSelectedBrand(newBrandName);
    const updatedUser = { ...user, BrandName: newBrandName, ResCode: null };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    localStorage.removeItem('selectedResCode');
    setSelectedResCode('');
    window.location.reload();
  };

  const brandOptions = [
    { value: 'RuNam', label: 'RuNam', logo: RunamLogo },
    { value: "RuNam D'or", label: "RuNam D'or", logo: RunamDorLogo },
    { value: 'Goody', label: 'Goody', logo: GoodyLogo },
    { value: 'Ciao Cafe', label: 'Ciao Cafe', logo: CiaoLogo },
    { value: 'Nhà hàng Thanh Niên', label: 'Nhà hàng Thanh Niên', logo: ThanhnienLogo },
    { value: 'Niso', label: 'Công ty cổ phần Niso', logo: NisoLogo }
  ];

  const handleCustomQuestionSubmit = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const payload = {
        brandName: user.BrandName,
        type: questionType,
        question: customQuestion,
        required: isRequired,
        step: selectedStep,
        dataType: dataType,
        placeholder: placeholder
      };

      if (questionType === 'rate') {
        payload.options = subQuestions.map(q => ({
          title: q.title || '',
          content: q.content || '',
          rate: q.rate || 0
        }));
      }

      if (editingQuestion) {
        const response = await axios.put(`/question/custom/${editingQuestion.id}`, {
          ...payload,
          id: editingQuestion.id,
          options: payload.options || editingQuestion.options
        }, {
          headers: {
            'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
          }
        });

        if (response.data.success) {
          message.success('Cập nhật câu hỏi thành công');
          await fetchQuestions();
        }
      } else {
        const response = await axios.post('/question/custom/add', payload);

        if (response.data.success) {
          message.success('Tạo câu hỏi thành công');
          await fetchQuestions();
        }
      }

      setQuestionType('');
      setCustomQuestion('');
      setRateOptions(['', '', '', '']);
      setAnswerOptions(['']);
      setIsRequired(false);
      setShowCustomQuestionForm(false);
      setEditingQuestion(null);
    } catch (error) {
      console.error('Lỗi khi xử lý câu hỏi:', error);
      message.error(error.message || 'Có lỗi xảy ra khi xử lý câu hỏi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setShowCustomQuestionForm(true);
  };

  const handleDeleteQuestion = async (question) => {
    Modal.confirm({
      title: t('cauhoi.Xác nhận xóa'),
      content: t('cauhoi.Bạn có chắc chắn muốn xóa câu hỏi này không?'),
      className: `${getModal(user.BrandName)}`,
      okText: <p style={{ fontSize: 12 }}>{t('cauhoi.Xóa')}</p>,
      cancelText: <p style={{ fontSize: 12 }}>{t('cauhoi.Hủy')}</p>,
      okButtonProps: {
        className: `${getClassName(user.BrandName)} static button-full-width`,
        size: 'small',
        style: { fontSize: '12px' }
      },
      cancelButtonProps: {
        className: `${getClassName(user.BrandName)} static button-full-width`,
        size: 'small',
        style: { fontSize: '12px' }
      },
      onOk: async () => {
        try {
          const response = await axios.delete(`/question/brand/${question.BrandName}/${question.id}`, {
            headers: {
              'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
            }
          });
          if (response.data.message === 'Deleted successfully') {
            message.success(t('cauhoi.Xóa câu hỏi thành công'));
            setCustomQuestions(prev => prev.filter(q => q.id !== question.id));
          }
        } catch (error) {
          console.error('Lỗi khi xóa câu hỏi:', error);
          message.error('Không thể xóa câu hỏi');
        }
      }
    });
  };

  const handleEditStorageForm = (form, isEditQuestion = false, hideControls = false) => {
    setEditingForm({ ...form, isEditQuestion });
    setShowFormStorageModal(true);
    setHideControls(hideControls);
  };

  const renderCustomQuestion = (question, onEditStorageForm) => {
    return (
      <CustomQuestion
        key={question.id}
        question={question}
        getquestion={getquestion}
        user={user}
        t={t}
        getRate={getRate}
        getCheckbox={getCheckbox}
        getColorRate={getColorRate}
        colorsCiaoCafe={colorsCiaoCafe}
        getInput={getInput}
        onEdit={handleEditQuestion}
        onEditStorageForm={handleEditStorageForm}
        onDelete={handleDeleteQuestion}
        form={form}
        index={currentIndex}
      />
    );
  };

  const fetchQuestionsByBrand = useCallback(async (brandName) => {
    try {
      const response = await axios.get(`/question/brand/${brandName}`, {
        headers: {
          'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
        },
        params: {
          resCode: user.ResCode
        }
      });

      if (response.data.fromStorage) {
        const storageQuestions = Array.isArray(response.data.questions) ? response.data.questions.map(q => ({ ...q, fromStorage: true, formId: response.data.id })) : [];
        setCustomQuestions(storageQuestions);
      } else {
        const questions = Array.isArray(response.data.questions) ? response.data.questions.map(q => ({ ...q, fromStorage: false })) : [];
        setCustomQuestions(questions);
      }
    } catch (error) {
      console.error('Lỗi khi tải câu hỏi theo thương hiệu:', error);
      message.error('Không thể tải câu hỏi theo thương hiệu');
    }
  }, [user.ResCode]);

  useEffect(() => {
    if (selectedBrand) {
      fetchQuestionsByBrand(selectedBrand);
    }
  }, [selectedBrand, fetchQuestionsByBrand]);

  const handleNext = () => {
    const currentValues = form.getFieldsValue();
    setFirstFormValues(prev => ({ ...prev, ...currentValues }));
    setCurrentStep(prev => prev + 1);
    form.resetFields();
  };

  const handlePrevious = () => {
    const currentValues = form.getFieldsValue();
    setFirstFormValues(prev => ({ ...prev, ...currentValues }));
    setCurrentStep(prev => prev - 1);
    form.resetFields();
  };

  const stopCountdown = useCallback(() => {
    setExitCountdown(5);
  }, []);

  const handleThankYouEdit = useCallback(async () => {
    try {
      const response = await axios.get(`/question/thankyou?brand=${user.BrandName}`, {
        headers: {
          'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
        }
      });

      setThankYouData({
        thankYouText: response.data?.thankYouText || 'Thank you',
        contentText: response.data?.contentText || 'Nội dung sau khi gửi'
      });
      setShowThankYou(true);
      setIsEditingThankYou(true);
      setExitCountdown(5);
      setIsModalVisible(false);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu thank you:', error);
      message.error('Không thể tải dữ liệu lời cảm ơn');
    }
  }, [user.BrandName]);

  const handleFormStorageUpdate = (updatedForm) => {
    if (updatedForm) {
      const updatedQuestions = customQuestions.map(q => {
        const updatedQuestion = updatedForm.steps.flatMap(step => step.questions).find(
          question => question.id === q.id
        );
        return updatedQuestion ? { ...q, ...updatedQuestion } : q;
      });

      setCustomQuestions(updatedQuestions);

      const updatedTitles = titles.map(title =>
        title.id === updatedForm.id ? { ...title, ...updatedForm, questions: updatedQuestions } : title
      );
      setTitles(updatedTitles);

      if (currentItem && currentItem.id === updatedForm.id) {
        setCurrentItem({ ...currentItem, ...updatedForm, questions: updatedQuestions });
      }

      const currentValues = form.getFieldsValue();
      const newValues = {
        ...currentValues,
        ...updatedForm.steps.flatMap(step => step.questions).reduce((acc, q) => ({
          ...acc,
          [q.id]: q.value || currentValues[q.id]
        }), {})
      };
      form.setFieldsValue(newValues);
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
      case "Niso":
        return "colorprogressNiso";
      default:
        return "";
    }
  };

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
      case "Niso":
        return "#8a6a16";
      default:
        return "";
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Lỗi khi vào chế độ toàn màn hình: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

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
    fetchForms();
  }, [fetchResCodes, fetchForms]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.ResCode) {
        setSelectedResCode(parsedUser.ResCode);
      }
    }
  }, []);

  const handleResCodeChange = (value) => {
    setSelectedResCode(value);
    const updatedUser = { ...user, ResCode: value };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    window.location.reload();
  };

  const getBrandLogo = (brandName) => {
    switch (brandName) {
      case 'RuNam':
        return RunamLogo;
      case "RuNam D'or":
        return RunamDorLogo;
      case 'Goody':
        return GoodyLogo;
      case 'Ciao Cafe':
        return CiaoLogo;
      case 'Nhà hàng Thanh Niên':
        return ThanhnienLogo;
      case 'Niso':
        return NisoLogo;
      default:
        return null;
    }
  };

  const convertImageToBase64 = (url, callback) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      const reader = new FileReader();
      reader.onloadend = function () {
        callback(reader.result);
      };
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  };

  const saveLogoToLocalStorage = (brandName, logoUrl) => {
    convertImageToBase64(logoUrl, (base64Image) => {
      localStorage.setItem(`${brandName}_logo`, base64Image);
    });
  };

  const getLogoFromLocalStorage = (brandName) => {
    return localStorage.getItem(`${brandName}_logo`);
  };

  const logo = user.BrandName === 'Niso' ? NisoLogo : (getLogoFromLocalStorage(user.BrandName) || getLogo(user.BrandName));
  if (!getLogoFromLocalStorage(user.BrandName) && getLogo(user.BrandName)) {
    saveLogoToLocalStorage(user.BrandName, getLogo(user.BrandName));
  }

  const handleLogoLoad = () => {
    setIsLogoLoaded(true);
  };

  const handleFooterLoad = () => {
    setIsFooterLoaded(true);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLogoLoaded(true);
      setIsFooterLoaded(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {(!isDataReady || isLoading || loadingProgress < 100) ? (
        <div style={{
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
          <LogoLoad user={user} />
          <Progress
            percent={loadingProgress}
            status="active"
            className={`${getProgressClass(user.BrandName)}`}
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
            color: getBrandColor(user.BrandName),
            transition: 'opacity 0.2s'
          }}>
            {user.BrandName} Loading...
          </span>
        </div>
      ) : (
        <>
          <CustomQuestionModal
            user={user}
            getClassName={getClassName}
            getModal={getModal}
            t={t}
            getInput={getInput}
            getquestion={getquestion}
            getRate={getRate}
            showCustomQuestionForm={showCustomQuestionForm}
            setShowCustomQuestionForm={setShowCustomQuestionForm}
            handleCustomQuestionSubmit={handleCustomQuestionSubmit}
            questionType={questionType}
            setQuestionType={setQuestionType}
            customQuestion={customQuestion}
            setCustomQuestion={setCustomQuestion}
            isRequired={isRequired}
            setIsRequired={setIsRequired}
            rateOptions={rateOptions}
            setRateOptions={setRateOptions}
            answerOptions={answerOptions}
            setAnswerOptions={setAnswerOptions}
            dataType={dataType}
            setDataType={setDataType}
            editingQuestion={editingQuestion}
            selectedStep={selectedStep}
            setSelectedStep={setSelectedStep}
            onClose={() => {
              setEditingQuestion(null);
              setShowCustomQuestionForm(false);
            }}
            onDelete={handleDeleteQuestion}
            setPlaceholder={setPlaceholder}
            fetchQuestions={fetchQuestions}
            customQuestions={customQuestions}
            setCustomQuestions={setCustomQuestions}
            onQuestionUpdate={fetchQuestions}
            subQuestions={subQuestions}
            setSubQuestions={setSubQuestions}
          />
          <FormStorageModal
            user={user}
            getClassName={getClassName}
            showFormStorageModal={showFormStorageModal}
            onClose={() => {
              setShowFormStorageModal(false);
              setEditingForm(null);
              setHideControls(false);
            }}
            t={t}
            onSubmit={handleCustomQuestionSubmit}
            editingForm={editingForm}
            hideControls={hideControls}
            onUpdate={handleFormStorageUpdate}
          />
          {Array.isArray(titles) && titles.length > 0 ? (
            titles.slice(0, 1).map((item, index) => (
              <React.Fragment key={index}>
                <title>NISO | CSS</title>
                {showThankYou && thankYouData ? (
                  <ThankYou
                    user={user}
                    geth1={geth1}
                    t={t}
                    getClassName={getClassName}
                    exitCountdown={exitCountdown}
                    handleCancelExit={handleCancelExit}
                    applyColors={applyColors}
                    colorsCiaoCafe={colorsCiaoCafe}
                    colorGoody={colorGoody}
                    colornhtn={colornhtn}
                    isEditing={isEditingThankYou}
                    setIsEditing={setIsEditingThankYou}
                    stopCountdown={stopCountdown}
                    startExitCountdown={startExitCountdown}
                    initialThankYouText={thankYouData.thankYouText}
                    initialContentText={thankYouData.contentText}
                  />
                ) : (
                  <Content className="container-content">
                    <Button
                      type='primary'
                      size="large"
                      className={`${getClassName(user.BrandName)} left__menu_admin__niso padding__niso__menu`}
                      onClick={showModal}
                    >
                      <p>
                        <MenuFoldOutlined style={{
                          color: user.BrandName === 'Ciao Cafe'
                            ? '#fff'
                            : user.BrandName === 'Goody'
                              ? 'rgb(241, 132, 174)'
                              : 'var(--color)',
                          fontSize: 20
                        }} />
                      </p>
                    </Button>
                    <div className="sidebar">
                      <Space direction='vertical' style={{ alignItems: 'center' }}>
                        <img
                          src={logo}
                          alt="Logo Brand"
                          className={user.BrandName === 'Niso' ? 'img_niso' : 'img_logo'}
                          onClick={() => navigate('/home')}
                          onLoad={handleLogoLoad}
                          style={{ opacity: isLogoLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
                        />
                        {user.PhanQuyen && (
                          <Space style={{ whiteSpace: 'nowrap', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }} direction='vertical'>
                            <Button
                              type="primary"
                              onClick={() => {
                                if (isFromStorage) {
                                  setShowFormStorageModal(true);
                                  setEditingForm({
                                    ...currentItem,
                                    isEditQuestion: true,
                                    steps: currentItem.steps || [],
                                    formName: currentItem.formName || '',
                                    brandName: currentItem.brandName || user.BrandName,
                                    chinhanh: currentItem.chinhanh || user.ResCode
                                  });
                                } else {
                                  setShowCustomQuestionForm(true);
                                }
                              }}
                              className={`${getClassName(user.BrandName)} jjsad`}
                              icon={<PlusOutlined />}
                            >
                              <p style={{ fontSize: 12 }}>{isFromStorage ? t('cauhoi.Chỉnh sửa câu hỏi') : t('cauhoi.Tạo câu hỏi')}</p>
                            </Button>
                          </Space>
                        )}
                      </Space>
                    </div>
                    <div className="main-content">
                      <div className="content">
                        <div className="form-container">
                          <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            initialValues={firstFormValues}
                          >
                            <SecondForm
                              user={user}
                              customQuestions={customQuestions}
                              renderCustomQuestion={renderCustomQuestion}
                              form={form}
                              t={t}
                              getInput={getInput}
                              getClassName={getClassName}
                              onFinish={onFinish}
                              submitting={submitting}
                              geth1={geth1}
                              getEditingState={getEditingState}
                              handleEditingState={handleEditingState}
                              processText={processText}
                              index={currentIndex}
                              EditableField={EditableField}
                              handleEditableChange={handleEditableChange}
                              item={currentItem}
                              questions={customQuestions}
                              currentStep={currentStep}
                              totalSteps={totalSteps}
                              onEditStorageForm={handleEditStorageForm}
                            />
                          </Form>
                          {user.PhanQuyen === true && customQuestions.filter(q => q.BrandName === user.BrandName).length > 0 && totalSteps > 1 && (
                            <Space direction='horizontal' style={{ justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                              {currentStep > 1 && (
                                <Button
                                  type="primary"
                                  icon={<LeftOutlined />}
                                  size="large"
                                  className={`${getClassName(user.BrandName)}`}
                                  onClick={handlePrevious}
                                  style={{ marginBottom: 16 }}
                                >
                                  <p style={{ fontSize: 12 }}>{t('cauhoi.Previous')}</p>
                                </Button>
                              )}
                              {currentStep < totalSteps && (
                                <Button
                                  type="primary"
                                  icon={<RightOutlined />}
                                  size="large"
                                  className={`${getClassName(user.BrandName)}`}
                                  onClick={handleNext}
                                  style={{ marginBottom: 16 }}
                                >
                                  <p style={{ fontSize: 12 }}>{t('cauhoi.Next')}</p>
                                </Button>
                              )}
                            </Space>
                          )}
                          {user.BrandName === 'Niso' && (
                            <img
                              src={NisoFooter}
                              alt="Footer"
                              className='Nisofooter'
                              onLoad={handleFooterLoad}
                              style={{ opacity: isFooterLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </Content>
                )}
              </React.Fragment>
            ))
          ) : (
            <Content className="container-content">
              <Button
                type='primary'
                size="large"
                className={`${getClassName(user.BrandName)} left__menu_admin__niso padding__niso__menu`}
                onClick={showModal}
              >
                <p>
                  <MenuFoldOutlined style={{
                    color: user.BrandName === 'Ciao Cafe'
                      ? '#fff'
                      : user.BrandName === 'Goody'
                        ? 'rgb(241, 132, 174)'
                        : 'var(--color)',
                    fontSize: 20
                  }} />
                </p>
              </Button>
              <div className="sidebar">
                <Space direction='vertical' style={{ alignItems: 'center' }}>
                  <img
                    src={logo}
                    alt="Logo Brand"
                    className={user.BrandName === 'Niso' ? 'img_niso' : 'img_logo'}
                    onClick={() => navigate('/home')}
                    onLoad={handleLogoLoad}
                    style={{ opacity: isLogoLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
                  />
                  {user.PhanQuyen && (
                    <Space style={{ whiteSpace: 'nowrap', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }} direction='vertical'>
                      <Button
                        type="primary"
                        onClick={() => {
                          if (isFromStorage) {
                            setShowFormStorageModal(true);
                            setEditingForm({
                              ...currentItem,
                              isEditQuestion: true,
                              steps: currentItem.steps || [],
                              formName: currentItem.formName || '',
                              brandName: currentItem.brandName || user.BrandName,
                              chinhanh: currentItem.chinhanh || user.ResCode
                            });
                          } else {
                            setShowCustomQuestionForm(true);
                          }
                        }}
                        className={`${getClassName(user.BrandName)} jjsad`}
                        icon={<PlusOutlined />}
                      >
                        <p style={{ fontSize: 12 }}>{isFromStorage ? t('cauhoi.Chỉnh sửa câu hỏi') : t('cauhoi.Tạo câu hỏi')}</p>
                      </Button>
                    </Space>
                  )}
                </Space>
              </div>
              <div className="main-content">
                <div className="content">
                  <div className="form-container">
                    <Form
                      form={form}
                      layout="vertical"
                      onFinish={onFinish}
                      initialValues={firstFormValues}
                    >
                      <SecondForm
                        user={user}
                        customQuestions={customQuestions}
                        renderCustomQuestion={renderCustomQuestion}
                        form={form}
                        t={t}
                        getInput={getInput}
                        getClassName={getClassName}
                        onFinish={onFinish}
                        submitting={submitting}
                        geth1={geth1}
                        getEditingState={getEditingState}
                        handleEditingState={handleEditingState}
                        processText={processText}
                        index={currentIndex}
                        EditableField={EditableField}
                        handleEditableChange={handleEditableChange}
                        item={currentItem}
                        questions={customQuestions}
                        currentStep={currentStep}
                        totalSteps={totalSteps}
                        onEditStorageForm={handleEditStorageForm}
                      />
                    </Form>
                    {user.PhanQuyen === true && customQuestions.filter(q => q.BrandName === user.BrandName).length > 0 && totalSteps > 1 && (
                      <Space direction='horizontal' style={{ justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        {currentStep > 1 && (
                          <Button
                            type="primary"
                            icon={<LeftOutlined />}
                            size="large"
                            className={`${getClassName(user.BrandName)}`}
                            onClick={handlePrevious}
                            style={{ marginBottom: 16 }}
                          >
                            <p style={{ fontSize: 12 }}>{t('cauhoi.Previous')}</p>
                          </Button>
                        )}
                        {currentStep < totalSteps && (
                          <Button
                            type="primary"
                            icon={<RightOutlined />}
                            size="large"
                            className={`${getClassName(user.BrandName)}`}
                            onClick={handleNext}
                            style={{ marginBottom: 16 }}
                          >
                            <p style={{ fontSize: 12 }}>{t('cauhoi.Next')}</p>
                          </Button>
                        )}
                      </Space>
                    )}
                  </div>
                </div>
              </div>
            </Content>
          )}
        </>
      )}
      <Modal
        title="Menu"
        visible={isModalVisible}
        onCancel={handleModalCancel}
        className={`${getModal(user.BrandName)}`}
        footer={[
          <div key="footer" style={{ fontSize: '11px', textAlign: 'center' }}>
            <p>©{new Date().getFullYear()} IT Team - NISO Company. All rights reserved.</p>
            <p>4th Floor, 199C Nguyen Van Huong, Thao Dien Ward, Thu Duc City, Ho Chi Minh City, Vietnam</p>
          </div>
        ]}
      >
        {user.PhanQuyen === false && (
          <span className={user.PhanQuyen ? 'Modal_niso-admin' : 'Modal_false'}>
            <span className={user.PhanQuyen ? 'Modal_niso-admin' : 'Modal_false'} style={{ marginBottom: 20 }}>Xin chào, {user.Fullname}</span>
          </span>
        )}
        <Space direction='horizontal' className='Modal_niso-admin'>
          <Button
            type='primary'
            size="large"
            className={`${getClassName(user.BrandName)} static button-full-width`}
            block
            onClick={() => navigate('/views')}
          >
            <p style={{ fontSize: '11px' }}>{t('cauhoi.Lịch sử')}</p>
          </Button>
          <Button
            type='primary'
            size="large"
            className={`${getClassName(user.BrandName)} static button-full-width`}
            block
            onClick={toggleFullscreen}
          >
            <p style={{ fontSize: '11px' }}>{isFullscreen ? t('cauhoi.Thoát toàn màn hình') : t('cauhoi.Toàn màn hình')}</p>
          </Button>
          {user.PhanQuyen === true && (
            <>
              <Link to='/admin'>
                <Button
                  type='primary'
                  size="large"
                  className={`${getClassName(user.BrandName)} static button-full-width`}
                  block
                >
                  <p style={{ fontSize: '11px' }}>{t('cauhoi.Nút tài khoản')}</p>
                </Button>
              </Link>
              <Link to='/rescode'>
                <Button
                  type='primary'
                  size="large"
                  className={`${getClassName(user.BrandName)} static button-full-width`}
                  block
                >
                  <p style={{ fontSize: '11px' }}>{t('cauhoi.Nút cửa hàng')}</p>
                </Button>
              </Link>
              <Button
                type='primary'
                size="large"
                className={`${getClassName(user.BrandName)} static button-full-width`}
                block
                onClick={handleThankYouEdit}
              >
                <p style={{ fontSize: '11px' }}>{t('cauhoi.Nút tùy chỉnh lời cảm ơn')}</p>
              </Button>
              <Button
                type='primary'
                size="large"
                onClick={() => navigate('/luu-tru')}
                className={`${getClassName(user.BrandName)} static button-full-width`}
                block
              >
                <p style={{ fontSize: '11px' }}>{t('cauhoi.Form lưu trữ')}</p>
              </Button>
              <Select
                size="large"
                style={{ width: '100%' }}
                onChange={handleBrandChange}
                value={selectedBrand}
                placeholder='Chọn thương hiệu'
                className={`${getSelect(user.BrandName)}`}
              >
                {brandOptions.map(({ value, label, logo }) => (
                  <Select.Option key={value} value={value}>
                    {logo && (
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        <img src={logo} alt={`${label} Logo`} style={{ width: 20, marginRight: 8 }} />
                        <span>{label}</span>
                      </span>
                    )}
                    {!logo && label}
                  </Select.Option>
                ))}
              </Select>
              <Select
                size="large"
                style={{ width: '100%' }}
                onChange={handleResCodeChange}
                value={selectedResCode || null}
                placeholder='Chọn nhà hàng áp dụng'
                className={`${getSelect(user.BrandName)}`}
                showSearch
                allowClear
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {resCodes
                  .filter(res => res.Brand === selectedBrand)
                  .map((res) => (
                    <Select.Option key={res.id} value={res.TenChiNhanh}>
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        <img
                          src={getBrandLogo(res.Brand)}
                          alt={`${res.Brand} Logo`}
                          style={{ width: 20, marginRight: 8 }}
                        />
                        <span>{res.TenChiNhanh}</span>
                      </span>
                    </Select.Option>
                  ))}
              </Select>
            </>
          )}
          <Button
            size='large'
            type='primary'
            className={`${getClassName(user.BrandName)} static button-full-width`}
            onClick={handleLogout}
            block
          >
            <p style={{ fontSize: '11px' }}>{t('cauhoi.Nút đăng xuất')}</p>
          </Button>
        </Space>
        <Language user={user} />
        <img
          src={NisoFooter}
          alt="Footer"
          className='Nisofooter'
          onLoad={handleFooterLoad}
          style={{ opacity: isFooterLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
        />
      </Modal>
    </>
  );
};

export default Home;