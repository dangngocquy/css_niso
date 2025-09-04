import React from 'react';
import { Modal, Button, Space, Select, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import Language from '../Language';
import { getModal, getClassName, getSelect } from '../form/Custom';

const HomeModal = ({
  isModalVisible,
  handleModalCancel,
  user,
  t,
  navigate,
  toggleFullscreen,
  isFullscreen,
  handleThankYouEdit,
  handleBrandChange,
  selectedBrand,
  brandOptions,
  handleAccountChange,
  selectedAccount,
  accounts,
  getBrandLogo,
  handleLogout
}) => {
  return (
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
            <Button
              type='primary'
              size="large"
              onClick={() => navigate('/rescode')}
              className={`${getClassName(user.BrandName)} static button-full-width`}
              block
            >
              <p style={{ fontSize: '11px' }}>{t('cauhoi.Nhà hàng')}</p>
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
              onChange={handleAccountChange}
              value={selectedAccount?.keys}
              placeholder='Chọn tài khoản áp dụng'
              className={`${getSelect(user.BrandName)}`}
              showSearch
              allowClear
              filterOption={(input, option) => {
                const children = option.children;
                if (typeof children === 'string') {
                  return children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                }
                if (React.isValidElement(children)) {
                  const text = children.props.children;
                  if (Array.isArray(text)) {
                    const searchText = text[1]?.toString() || '';
                    return searchText.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                  }
                  const searchText = text?.toString() || '';
                  return searchText.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                }
                return false;
              }}
              disabled={!selectedBrand || !accounts.some(acc => acc.BrandName === selectedBrand)}
            >
              {accounts
                .filter(acc => acc.BrandName === selectedBrand)
                .map((acc) => (
                  <Select.Option key={acc.keys} value={acc.keys}>
                    <Tooltip 
                      title={`${acc.Email} - ${acc.ResCode}`}
                      mouseEnterDelay={0}
                      placement="bottom"
                    >
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        <img
                          src={getBrandLogo(acc.BrandName)}
                          alt={`${acc.BrandName} Logo`}
                          style={{ width: 20, marginRight: 8 }}
                        />
                        <span style={{ 
                          maxWidth: '150px', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap',
                          display: 'inline-block'
                        }}>
                          {acc.Email}
                        </span>
                      </span>
                    </Tooltip>
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
    </Modal>
  );
};

export default HomeModal; 