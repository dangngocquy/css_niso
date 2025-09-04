import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Form, Select, message, Button } from 'antd';
import axios from 'axios';
import { getSelect, getClassName, getModal } from './Custom';

const CopyStepModal = ({
  visible,
  onClose,
  currentStep,
  user,
  t,
  onSuccess,
  currentForm
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [formNames, setFormNames] = useState([]);
  const [selectedForm, setSelectedForm] = useState(currentForm);
  const [availableSteps, setAvailableSteps] = useState([]);

  const fetchFormNames = useCallback(async () => {
    try {
      const response = await axios.get('/question/storage/list', {
        headers: {
          'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
        }
      });
      if (response.data.success) {
        setFormNames(response.data.forms);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách form:', error);
      message.error(t('cauhoi.Không thể lấy danh sách form'));
    }
  }, [t]);

  useEffect(() => {
    if (visible) {
      fetchFormNames();
      if (currentForm) {
        setSelectedForm(currentForm);
        const availableSteps = currentForm.steps
          .filter(step => step.step >= currentStep)
          .map(step => ({
            label: `Step ${step.step}`,
            value: step.step
          }));
        setAvailableSteps(availableSteps);
      }
    }
  }, [visible, fetchFormNames, currentForm, currentStep]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Tìm form đích từ formNames
      const targetForm = formNames.find(form => form.formName.vi === values.targetForm);
      
      if (!targetForm) {
        throw new Error(t('cauhoi.Không tìm thấy form đích'));
      }

      // Kiểm tra xem step đích đã có dữ liệu chưa
      const targetStep = targetForm.steps.find(step => step.step === values.steps);
      if (targetStep && targetStep.questions && targetStep.questions.length > 0) {
        Modal.confirm({
          title: t('cauhoi.Xác nhận'),
          content: t('cauhoi.Step này đã có dữ liệu. Bạn có muốn sao chép không?'),
          onOk: async () => {
            await copyStep(values, targetForm);
          }
        });
      } else {
        await copyStep(values, targetForm);
      }
    } catch (error) {
      message.error(t('cauhoi.Vui lòng kiểm tra lại thông tin'));
    } finally {
      setLoading(false);
    }
  };

  const copyStep = async (values, targetForm) => {
    try {
      const response = await axios.post('/question/storage/copy-steps', {
        sourceFormId: selectedForm.id,
        targetFormId: targetForm.id,
        sourceStep: currentStep,
        targetStep: values.steps
      }, {
        headers: {
          'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
        }
      });

      if (response.data.success) {
        message.success(t('cauhoi.Sao chép step thành công'));
        onSuccess();
        onClose();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      message.error(error.message || t('cauhoi.Không thể sao chép step'));
    }
  };

  return (
    <Modal
      title={t('cauhoi.Sao chép step')}
      open={visible}
      onCancel={onClose}
      className={`${getModal(user.BrandName)}`}
      footer={[
        <Button key="cancel" onClick={onClose} className={`${getClassName(user.BrandName)} static button-full-width`}>
          <p style={{ fontSize: 12 }}>{t('cauhoi.Hủy')}</p>
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
          className={`${getClassName(user.BrandName)} static button-full-width`}
        >
          <p style={{ fontSize: 12 }}>{t('cauhoi.Xác nhận')}</p>
        </Button>
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label={t('cauhoi.Form nguồn')}
          name="formId"
          initialValue={currentForm?.id}
        >
          <Select
            disabled={true}
            value={currentForm?.id}
            className={getSelect(user.BrandName)}
          >
            <Select.Option key={currentForm?.id} value={currentForm?.id}>
              {currentForm?.formName?.vi}
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label={t('cauhoi.Chọn form đích')}
          name="targetForm"
          rules={[{ required: true, message: t('cauhoi.Vui lòng chọn form đích') }]}
        >
          <Select
            placeholder={t('cauhoi.Chọn form đích')}
            className={getSelect(user.BrandName)}
            onChange={(value) => {
              const targetForm = formNames.find(form => form.formName.vi === value);
              if (targetForm) {
                // Lấy số step hiện tại của form đích
                const currentStepCount = targetForm.steps.length;
                // Kiểm tra xem form đích có phải là form nguồn không
                const isSameForm = targetForm.id === currentForm.id;
                
                // Tạo danh sách steps
                const availableSteps = [
                  // Thêm tất cả steps hiện có
                  ...targetForm.steps
                    .filter(step => !isSameForm || step.step !== currentStep) // Chỉ lọc step khi là cùng form
                    .map(step => ({
                      label: `Step ${step.step}`,
                      value: step.step
                    })),
                  // Thêm step tiếp theo
                  {
                    label: `Step ${currentStepCount + 1}`,
                    value: currentStepCount + 1
                  }
                ];
                setAvailableSteps(availableSteps);
                form.setFieldsValue({ steps: undefined }); // Reset giá trị step đã chọn
              }
            }}
          >
            {formNames.map(form => (
              <Select.Option key={form.id} value={form.formName.vi}>
                {form.formName.vi}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {form.getFieldValue('targetForm') && (
          <Form.Item
            label={t('cauhoi.Chọn step')}
            name="steps"
            rules={[{ required: true, message: t('cauhoi.Vui lòng chọn step') }]}
          >
            <Select
              placeholder={t('cauhoi.Chọn step')}
              className={getSelect(user.BrandName)}
              disabled={!selectedForm}
            >
              {availableSteps.map(step => (
                <Select.Option key={step.value} value={step.value}>
                  {step.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default CopyStepModal;