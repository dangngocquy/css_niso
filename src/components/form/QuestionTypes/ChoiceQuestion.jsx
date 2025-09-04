import React from 'react';
import { Form, Input, Tabs, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { getInput, getTabs, getquestion2, getClassName } from '../Custom';

const { TabPane } = Tabs;

const ChoiceQuestion = ({
  questionIndex,
  questionsData,
  currentStep,
  setQuestionsData,
  activeTabKey,
  setActiveTabKey,
  t,
  user,
  message
}) => {
  return (
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
              placeholder={t('cauhoi.Nhập nội dung mô tả cho câu hỏi')}
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
  );
};

export default ChoiceQuestion; 