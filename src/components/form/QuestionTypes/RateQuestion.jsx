import React from 'react';
import { Form, Input, Tabs, Rate, Button, Space, Divider } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { getInput, getTabs, getquestion2, getRate, getClassName } from '../Custom';

const { TabPane } = Tabs;

const RateQuestion = ({
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
  );
};

export default RateQuestion; 