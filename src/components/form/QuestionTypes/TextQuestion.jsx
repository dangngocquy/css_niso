import React from 'react';
import { Form, Input, Select, Tabs } from 'antd';
import { getInput, getSelect, getTabs, getquestion2 } from '../Custom';

const { TabPane } = Tabs;

const TextQuestion = ({
  questionIndex,
  questionsData,
  currentStep,
  setQuestionsData,
  activeTabKey,
  setActiveTabKey,
  t,
  user
}) => {
  return (
    <>
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
    </>
  );
};

export default TextQuestion; 