import React, { useState, useEffect, useCallback } from 'react';
import { Table, Input, Form, Button, Space, Modal, Select, Card, Drawer, List, message } from 'antd';
import axios from 'axios';
import { PlusOutlined, SettingOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { getClassName, getInput, getTableColor, getSelect, getModal, getDraw, getTableColor2 } from './form/Custom';
import { useNavigate } from 'react-router-dom';
import { RollbackOutlined } from '@ant-design/icons';

function CreateAPI({ user, t }) {
  const [form] = Form.useForm();
  const [data, setData] = useState([
    {
      key: 'field_1',
      fieldName: '',
      value: ''
    }
  ]);
  const [apiConfig, setApiConfig] = useState({
    url: '',
    method: '',
    username: '',
    password: ''
  });
  const [editingKey, setEditingKey] = useState('');
  const [isConfigModalVisible, setIsConfigModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [apiName, setApiName] = useState('');
  const [apiList, setApiList] = useState([]);
  const [visibleButton, setVisibleButton] = useState('SAVE');
  const [fetchedData, setFetchedData] = useState([]);
  const [fetchColumns, setFetchColumns] = useState([]);
  const [isDataDrawerVisible, setIsDataDrawerVisible] = useState(false);
  const [brandQuestions, setBrandQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [formData, setFormData] = useState({});
  const [isQuestionModalVisible, setIsQuestionModalVisible] = useState(false);

  const navigate = useNavigate();
  const handleGoBack = () => {
    navigate(-1);
  };


  const methodOptions = [
    { value: 'GET', label: 'GET' },
    { value: 'POST', label: 'POST' },
    { value: 'PUT', label: 'PUT' },
    { value: 'DELETE', label: 'DELETE' }
  ];

  const columns = [
    {
      title: 'Tên trường',
      dataIndex: 'fieldName',
      key: 'fieldName',
      render: (text, record) => {
        const isEditing = record.key === editingKey;
        return isEditing ? (
          <Input
            placeholder="Nhập tên trường"
            value={text}
            className={`${getInput(user.BrandName)} custom__input2`}
            onChange={(e) => handleFieldNameChange(record.key, e.target.value)}
          />
        ) : (
          <span>{text}</span>
        );
      }
    },
    {
      title: 'Giá trị',
      dataIndex: 'value',
      key: 'value',
      render: (text, record) => {
        const isEditing = record.key === editingKey;
        return isEditing ? (
          <Input
            placeholder="Nhập giá trị"
            value={text}
            onChange={(e) => handleInputChange(record.key, e.target.value)}
            className={`${getInput(user.BrandName)} custom__input2`}
          />
        ) : (
          <span>{text}</span>
        );
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => {
        const isEditing = record.key === editingKey;
        return isEditing ? (
          <Space>
            <Button type="primary" onClick={() => handleSaveEdit(record.key)} className={`${getClassName(user.BrandName)}`}>
              <p>Lưu</p>
            </Button>
            <Button onClick={handleCancelEdit} className={`${getClassName(user.BrandName)}`} >
              <p>Hủy</p>
            </Button>
          </Space>
        ) : (
          <Space>
            <Button type="primary" onClick={() => handleEdit(record.key)} className={`${getClassName(user.BrandName)}`}>
              <p>Sửa</p>
            </Button>
            <Button onClick={() => handleDelete(record.key)} className={`${getClassName(user.BrandName)}`}>
              <p>Xóa</p>
            </Button>
          </Space>
        );
      }
    }
  ];

  const handleEdit = (key) => {
    setEditingKey(key);
  };

  const handleCancelEdit = () => {
    setEditingKey('');
  };

  const handleSaveEdit = (key) => {
    setEditingKey('');
  };

  const handleDelete = (key) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa trường này không?',
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
      onOk: () => {
        setData(data.filter(item => item.key !== key));
      }
    });
  };

  const handleAddField = () => {
    const newKey = `field_${Date.now()}`;
    const newField = {
      key: newKey,
      fieldName: '',
      value: ''
    };
    setData([...data, newField]);
    setEditingKey(newKey);
  };

  const handleFieldNameChange = (key, fieldName) => {
    const newData = data.map(item => {
      if (item.key === key) {
        return { ...item, fieldName };
      }
      return item;
    });
    setData(newData);
  };

  const handleInputChange = (key, value) => {
    const newData = data.map(item => {
      if (item.key === key) {
        return { ...item, value };
      }
      return item;
    });
    setData(newData);
  };

  const handleSubmit = async () => {
    try {
      if (!apiName.trim()) {
        Modal.error({
          title: 'Lỗi',
          content: 'Vui lòng nhập tên cho API',
          className: `${getModal(user.BrandName)}`,
          okText: <p>Đóng</p>,
          okButtonProps: {
            className: `${getClassName(user.BrandName)} static button-full-width`
          }
        });
        return;
      }

      if (!apiConfig.method) {
        Modal.error({
          title: 'Lỗi',
          content: 'Vui lòng chọn phương thức API',
          className: `${getModal(user.BrandName)}`,
          okText: <p>Đóng</p>,
          okButtonProps: {
            className: `${getClassName(user.BrandName)} static button-full-width`
          }
        });
        return;
      }

      const formData = {
        apiConfig: {
          name: apiName,
          url: apiConfig.url,
          method: apiConfig.method,
          username: apiConfig.username,
          password: apiConfig.password,
        },
        fields: data.map(item => ({
          fieldName: item.fieldName,
          value: item.value
        }))
      };

      await axios.post('/api-config/save', formData, {
        headers: {
          'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
        }
      });

      await loadApiList();

      Modal.success({
        title: 'Thành công',
        content: 'Lưu cấu hình API thành công',
        className: `${getModal(user.BrandName)}`,
        okText: <p>Đóng</p>,
        okButtonProps: {
          className: `${getClassName(user.BrandName)} static button-full-width`
        }
      });

      setApiName('');
      setApiConfig({
        url: '',
        method: '',
        username: '',
        password: ''
      });
      setData([{ key: 'field_1', fieldName: '', value: '' }]);

    } catch (error) {
      Modal.error({
        title: 'Lỗi',
        content: `Lỗi khi lưu cấu hình: ${error.message}`,
        className: `${getModal(user.BrandName)}`,
        okText: <p>Đóng</p>,
        okButtonProps: {
          className: `${getClassName(user.BrandName)} static button-full-width`
        }
      });
    }
  };

  const handleSaveData = async () => {
    try {
      if (!apiName.trim()) {
        Modal.error({
          title: 'Lỗi',
          content: 'Vui lòng nhập tên cho API',
          className: `${getModal(user.BrandName)}`,
          okText: <p>Đóng</p>,
          okButtonProps: {
            className: `${getClassName(user.BrandName)} static button-full-width`
          }
        });
        return;
      }

      if (!apiConfig.method) {
        Modal.error({
          title: 'Lỗi',
          content: 'Vui lòng chọn phương thức API',
          className: `${getModal(user.BrandName)}`,
          okText: <p>Đóng</p>,
          okButtonProps: {
            className: `${getClassName(user.BrandName)} static button-full-width`
          }
        });
        return;
      }

      const formData = {
        apiConfig: {
          name: apiName,
          url: apiConfig.url,
          method: apiConfig.method,
          username: apiConfig.username,
          password: apiConfig.password,
        },
        fields: data.map(item => ({
          fieldName: item.fieldName,
          value: item.value
        }))
      };

      await axios.post('/api-config/save-draft', formData, {
        headers: {
          'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
        }
      });

      Modal.success({
        title: 'Thành công',
        content: 'Đã lưu dữ liệu thành công',
        className: `${getModal(user.BrandName)}`,
        okText: <p>Đóng</p>,
        okButtonProps: {
          className: `${getClassName(user.BrandName)} static button-full-width`
        }
      });

    } catch (error) {
      Modal.error({
        title: 'Lỗi',
        content: `Lỗi khi lưu dữ liệu: ${error.message}`,
        className: `${getModal(user.BrandName)}`,
        okText: <p>Đóng</p>,
        okButtonProps: {
          className: `${getClassName(user.BrandName)} static button-full-width`
        }
      });
    }
  };

  const handleMethodChange = (value) => {
    setApiConfig({ ...apiConfig, method: value });
    setVisibleButton(value);
  };

  const showConfigModal = () => {
    setIsConfigModalVisible(true);
  };

  const handleConfigModalOk = () => {
    setIsConfigModalVisible(false);
  };

  const handleConfigModalCancel = () => {
    setIsConfigModalVisible(false);
  };

  const showDrawer = () => {
    setIsDrawerVisible(true);
  };

  const closeDrawer = () => {
    setIsDrawerVisible(false);
  };

  const showDataDrawer = () => {
    setIsDataDrawerVisible(true);
  };

  const closeDataDrawer = () => {
    setIsDataDrawerVisible(false);
  };

  const loadApiList = useCallback(async () => {
    try {
      const response = await axios.get('/api-config/list', {
        headers: {
          'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
        }
      });
      setApiList(response.data.apiConfigs || []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách API:', error);
      Modal.error({
        title: 'Lỗi',
        content: 'Không thể tải danh sách API',
        className: `${getModal(user.BrandName)}`,
        okText: <p>Đóng</p>,
        okButtonProps: {
          className: `${getClassName(user.BrandName)} static button-full-width`
        }
      });
    }
  }, [user.BrandName]);

  const handleDeleteApi = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa cấu hình API này không?',
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
      onOk: async () => {
        try {
          await axios.delete(`/api-config/${id}`, {
            headers: {
              'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
            }
          });

          loadApiList();

          Modal.success({
            title: 'Thành công',
            content: 'Đã xóa cấu hình API thành công',
            className: `${getModal(user.BrandName)}`,
            okText: <p>Đóng</p>,
            okButtonProps: {
              className: `${getClassName(user.BrandName)} static button-full-width`
            }
          });
        } catch (error) {
          Modal.error({
            title: 'Lỗi',
            content: `Lỗi khi xóa cấu hình: ${error.message}`,
            className: `${getModal(user.BrandName)}`,
            okText: <p>Đóng</p>,
            okButtonProps: {
              className: `${getClassName(user.BrandName)} static button-full-width`
            }
          });
        }
      }
    });
  };

  const handleGetData = async () => {
    try {
      if (!apiConfig.url) {
        Modal.error({
          title: 'Lỗi',
          content: 'Vui lòng nhập URL API',
          className: `${getModal(user.BrandName)}`,
          okText: <p>Đóng</p>,
          okButtonProps: {
            className: `${getClassName(user.BrandName)} static button-full-width`
          }
        });
        return;
      }

      const response = await axios.get(apiConfig.url, {
        headers: {
          'Authorization': apiConfig.username && apiConfig.password 
            ? `Basic ${btoa(`${apiConfig.username}:${apiConfig.password}`)}` 
            : undefined
        }
      });

      const data = response.data;
      
      if (Array.isArray(data)) {
        const columns = data.length > 0 
          ? Object.keys(data[0]).map(key => ({
              title: key,
              dataIndex: key,
              key: key
            }))
          : [];
        
        setFetchColumns(columns);
        setFetchedData(data.map((item, index) => ({
          ...item,
          key: index.toString()
        })));
      } else if (typeof data === 'object') {
        const columns = Object.keys(data).map(key => ({
          title: key,
          dataIndex: key,
          key: key
        }));
        
        setFetchColumns(columns);
        setFetchedData([{ ...data, key: '0' }]);
      } else {
        message.warning('Dữ liệu trả về không ở định dạng mong đợi');
      }

      Modal.success({
        title: 'Thành công',
        content: 'Đã tải dữ liệu thành công',
        className: `${getModal(user.BrandName)}`,
        okText: <p>Đóng</p>,
        okButtonProps: {
          className: `${getClassName(user.BrandName)} static button-full-width`
        }
      });

      showDataDrawer();

    } catch (error) {
      Modal.error({
        title: 'Lỗi',
        content: `Không thể tải dữ liệu: ${error.message}`,
        className: `${getModal(user.BrandName)}`,
        okText: <p>Đóng</p>,
        okButtonProps: {
          className: `${getClassName(user.BrandName)} static button-full-width`
        }
      });
    }
  };

  const fetchQuestionsByBrand = async () => {
    try {
      const response = await axios.get(`/questions/${user.BrandName}`, {
        headers: {
          'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
        }
      });
      const questions = response.data.questions;
      setBrandQuestions(questions);

      setIsQuestionModalVisible(true);
    } catch (error) {
      Modal.error({
        title: 'Lỗi',
        content: `Không thể tải danh sách câu hỏi: ${error.message}`,
        className: `${getModal(user.BrandName)}`,
        okText: <p>Đóng</p>,
        okButtonProps: {
          className: `${getClassName(user.BrandName)} static button-full-width`
        }
      });
    }
  };

  const handlePostData = async () => {
    try {
      const response = await axios.post('/api-config/post-data', {
        apiConfig,
        selectedQuestions,
        formData
      }, {
        headers: {
          'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
        }
      });

      Modal.success({
        title: 'Thành công',
        content: `Đã gửi dữ liệu thành công. Mã phản hồi: ${response.status}`,
        className: `${getModal(user.BrandName)}`,
        okText: <p>Đóng</p>,
        okButtonProps: {
          className: `${getClassName(user.BrandName)} static button-full-width`
        }
      });

      setSelectedQuestions([]);
      setFormData({});
      setIsQuestionModalVisible(false);
    } catch (error) {
      Modal.error({
        title: 'Lỗi',
        content: `Lỗi khi gửi dữ liệu: ${error.response?.data?.message || error.message}`,
        className: `${getModal(user.BrandName)}`,
        okText: <p>Đóng</p>,
        okButtonProps: {
          className: `${getClassName(user.BrandName)} static button-full-width`
        }
      });
    }
  };

  const showQuestionSelectionModal = () => {
    fetchQuestionsByBrand();
  };

  useEffect(() => {
    loadApiList();
  }, [loadApiList]);

  return (
    <Card style={{ position: 'relative', zIndex: 3, background: 'transparent', minHeight: '100vh' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }} >
        <Button className={`${getClassName(user.BrandName)} padding__niso__menu`} size='large' type='primary' onClick={handleGoBack}><p><RollbackOutlined style={{
          color: user.BrandName === 'Ciao Cafe'
            ? '#fff'
            : user.BrandName === 'Goody'
              ? 'rgb(241, 132, 174)'
              : 'var(--color)',
          fontSize: 18
        }} /></p></Button>
        <h1 style={{
          textTransform: 'uppercase',
          color: user.BrandName === 'Ciao Cafe'
            ? 'rgb(111, 112, 114)'
            : user.BrandName === 'Goody'
              ? 'rgb(111, 112, 114)'
              : user.BrandName === 'Nh hàng Thanh Niên'
                ? 'rgb(35, 32, 32)'
                : '#ae8f3d',
          marginBottom: 20
        }}>Tạo mới và tùy chỉnh API (Coming soon !)</h1>
      </span>
      <Input
        placeholder="Đặt tên API"
        value={apiName}
        onChange={(e) => setApiName(e.target.value)}
        style={{ marginBottom: 20, borderBottom: '2px solid var(--border-main)' }}
        className={`${getInput(user.BrandName)} custom__input2`}
      />
      <Space style={{ marginBottom: '20px' }}>
        <Button
          icon={<UnorderedListOutlined />}
          onClick={showDrawer}
          className={`${getClassName(user.BrandName)}`}
        >
          <p>Danh sách API</p>
        </Button>
        <Button
          type="primary"
          icon={<SettingOutlined />}
          onClick={showConfigModal}
          className={`${getClassName(user.BrandName)}`}
        >
          <p>Cấu hình API</p>
        </Button>
      </Space>

      <Drawer
        title="Danh sách API đã cấu hình"
        placement="right"
        onClose={closeDrawer}
        open={isDrawerVisible}
        width={1000}
        bodyStyle={{
          background: `${getDraw(user.BrandName)}`,
          paddingBottom: 80
        }}
        headerStyle={{
          background: `${getDraw(user.BrandName)}`
        }}
      >
        <List
          dataSource={apiList}
          renderItem={item => (
            <List.Item
              actions={[
                <Button
                  danger
                  onClick={() => handleDeleteApi(item.id)}
                  className={`${getClassName(user.BrandName)}`}
                >
                  <p>Xóa</p>
                </Button>
              ]}
            >
              <List.Item.Meta
                title={item.name}
                description={`${item.method} ${item.url}`}
              />
            </List.Item>
          )}
        />
      </Drawer>

      <Modal
        title="Cấu hình API"
        open={isConfigModalVisible}
        className={`${getModal(user.BrandName)}`}
        onOk={handleConfigModalOk}
        okText={<p>Lưu</p>}
        cancelText={<p>Hủy</p>}
        onCancel={handleConfigModalCancel}
        okButtonProps={{
          className: `${getClassName(user.BrandName)} static button-full-width`
        }}
        cancelButtonProps={{
          className: `${getClassName(user.BrandName)} static button-full-width`
        }}
      >
        <Form form={form}>
          <Input
            placeholder="URL API"
            value={apiConfig.url}
            onChange={(e) => setApiConfig({ ...apiConfig, url: e.target.value })}
            style={{ marginBottom: '10px' }}
            className={`${getInput(user.BrandName)} custom__input2`}
          />
          <Select
                value={apiConfig.method || undefined}
                className={`${getSelect(user.BrandName)}`}
                onChange={handleMethodChange}
                style={{ width: '100%', marginBottom: '10px' }}
                options={methodOptions}
                placeholder="Chọn phương thức"
          />
          <Input
            placeholder="Username (nếu cần)"
            value={apiConfig.username}
            onChange={(e) => setApiConfig({ ...apiConfig, username: e.target.value })}
            style={{ marginBottom: '10px' }}
            className={`${getInput(user.BrandName)} custom__input2`}
          />
          <Input.Password
            placeholder="Password (nếu cần)"
            value={apiConfig.password}
            onChange={(e) => setApiConfig({ ...apiConfig, password: e.target.value })}
            className={`${getInput(user.BrandName)} custom__input2`}
          />
        </Form>
      </Modal>

      <Table
        columns={columns}
        dataSource={data}
        className={`${getTableColor(user.BrandName)}`}
        pagination={false}
        footer={() => (
          <Button
            type="primary"
            onClick={handleAddField}
            style={{ width: '100%' }}
            icon={<PlusOutlined />}
            disabled={editingKey !== ''}
            className={`${getClassName(user.BrandName)}`}
          >
            <p>Thêm trường mới</p>
          </Button>
        )}
      />

      <Drawer
        title="Dữ liệu được tải"
        placement="bottom"
        onClose={closeDataDrawer}
        open={isDataDrawerVisible}
        height={800}
        bodyStyle={{
          background: `${getDraw(user.BrandName)}`,
          paddingBottom: 80
        }}
        headerStyle={{
          background: `${getDraw(user.BrandName)}`
        }}
      >
        {fetchedData.length > 0 ? (
          <Table 
            columns={fetchColumns} 
            dataSource={fetchedData} 
            className={`${getTableColor2(user.BrandName)}`}
            scroll={{ x: true }}
          />
        ) : (
          <p>Không có dữ liệu</p>
        )}
      </Drawer>

      <Space style={{ marginTop: '20px' }}>
        <Button
          onClick={handleSaveData}
          disabled={editingKey !== ''}
          className={`${getClassName(user.BrandName)}`}
        >
          <p>SAVE DATA</p>
        </Button>
        
        {visibleButton === 'GET' && (
          <Button
            type="primary"
            onClick={handleGetData}
            disabled={editingKey !== ''}
            className={`${getClassName(user.BrandName)}`}
          >
            <p>GET DATA</p>
          </Button>
        )}
        
        {visibleButton === 'POST' && (
          <>
            <Button
              type="primary"
              onClick={showQuestionSelectionModal}
              disabled={editingKey !== ''}
              className={`${getClassName(user.BrandName)}`}
            >
              <p>Chọn Câu Hỏi</p>
            </Button>
            {selectedQuestions.length > 0 && (
              <Button
                type="primary"
                onClick={handlePostData}
                disabled={editingKey !== ''}
                className={`${getClassName(user.BrandName)}`}
              >
                <p>Gửi Dữ Liệu</p>
              </Button>
            )}
          </>
        )}
        
        {visibleButton === 'PUT' && (
          <Button
            type="primary"
            onClick={handleSubmit}
            disabled={editingKey !== ''}
            className={`${getClassName(user.BrandName)}`}
          >
            <p>PUT DATA</p>
          </Button>
        )}
        
        {visibleButton === 'DELETE' && (
          <Button
            type="primary"
            onClick={handleSubmit}
            disabled={editingKey !== ''}
            className={`${getClassName(user.BrandName)}`}
          >
            <p>DELETE DATA</p>
          </Button>
        )}
      </Space>

      <Modal
        title="Chọn câu hỏi để gửi"
        visible={isQuestionModalVisible}
        onOk={() => {
          setIsQuestionModalVisible(false);
        }}
        onCancel={() => {
          setIsQuestionModalVisible(false);
        }}
        width={800}
      >
        <Table
          rowSelection={{
            type: 'checkbox',
            onChange: (selectedRowKeys, selectedRows) => {
              setSelectedQuestions(selectedRows);
            }
          }}
          columns={[
            {
              title: 'Tên câu hỏi',
              dataIndex: 'question',
              key: 'question'
            },
            {
              title: 'Loại',
              dataIndex: 'type',
              key: 'type'
            }
          ]}
          dataSource={brandQuestions.map(q => ({
            ...q,
            key: q.id
          }))}
        />
        
        {selectedQuestions.map(question => (
          <Form.Item key={question.id} label={question.question}>
            {question.type === 'text' && (
              <Input 
                onChange={(e) => setFormData({
                  ...formData,
                  [question.name]: e.target.value
                })}
              />
            )}
            {question.type === 'choice' && (
              <Select
                onChange={(value) => setFormData({
                  ...formData,
                  [question.name]: value
                })}
                options={question.options.map(opt => ({
                  label: opt,
                  value: opt
                }))}
              />
            )}
          </Form.Item>
        ))}
      </Modal>
    </Card>
  );
}

export default React.memo(CreateAPI);