import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Checkbox, message, Layout } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';
import Background from '../asset/niso.png';
import Language from './Language';
// import GiangSinh from '../asset/jingle-bells-bells-only-181672.mp3';
// import { SoundOutlined } from '@ant-design/icons';

const Login = ({ setUser, t, user }) => {
  const [loading, setLoading] = useState(false);
  // const [userInteracted, setUserInteracted] = useState(false);
  const audioRef = useRef(null);
  const navigate = useNavigate();
  const { Content } = Layout;

  useEffect(() => {
    const audioElement = audioRef.current;

    if (audioElement) {
      const handleEnded = () => {
        audioElement.play();
      };

      audioElement.addEventListener('ended', handleEnded);

      audioElement.play().catch(error => {
        console.log('Không thể tự động phát nhạc:', error);
      });

      // Cleanup function
      return () => {
        audioElement.removeEventListener('ended', handleEnded);
      };
    }
  }, []);

  // useEffect(() => {
  //   const handleClick = () => {
  //     if (audioRef.current && !isPlaying && !userInteracted) {
  //       audioRef.current.play();
  //       setIsPlaying(true);
  //     }
  //   };

  //   const playButton = document.querySelector('.btn__play__music');
  //   const handleDocumentClick = (event) => {
  //     if (!playButton.contains(event.target)) {
  //       handleClick();
  //     }
  //   };

  //   document.addEventListener('click', handleDocumentClick);

  //   return () => {
  //     document.removeEventListener('click', handleDocumentClick);
  //   };
  // }, [isPlaying, userInteracted]);

  // const togglePlay = () => {
  //   if (audioRef.current) {
  //     if (isPlaying) {
  //       audioRef.current.pause();
  //     } else {
  //       audioRef.current.play();
  //     }
  //     setIsPlaying(!isPlaying);
  //     setUserInteracted(true);
  //   }
  // };

  const onFinish = async (values) => {
    const loginData = {
      ...values,
      rememberPassword: true
    };

    setLoading(true);
    try {
      const response = await axios.post('/login/dashboard', loginData, {
        headers: {
          'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
        }
      });
      const user = response.data;

      localStorage.setItem('user', JSON.stringify(user));

      if (audioRef.current) {
        audioRef.current.pause();
      }

      setUser(user);
      message.success('Login successful!');
      navigate('/home');
    } catch (error) {
      message.error('Incorrect login information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="center-report-login-niso" style={{ minHeight: '100vh' }}>
      {/* <div className="snowflakes" aria-hidden="true">
        <div className="snowflake" style={{ fontSize: '30px' }}>❅</div>
        <div className="snowflake">❅</div>
        <div className="snowflake" style={{ fontSize: '40px' }}>❆</div>
        <div className="snowflake">❅</div>
        <div className="snowflake" style={{ fontSize: '30px' }}>❆</div>
        <div className="snowflake" style={{ fontSize: '22px' }}>❅</div>
        <div className="snowflake" style={{ fontSize: '50px' }}>❆</div>
        <div className="snowflake" style={{ fontSize: '20px' }}>❅</div>
        <div className="snowflake" style={{ fontSize: '70px' }}>❆</div>
        <div className="snowflake" style={{ fontSize: '20px' }}>❆</div>
      </div>*/}
      <Content className="login-content background__login__niso">
        <div className="containers">
          <div className="margin">
            <title>NISO CSS | SIGN IN</title>
            <div className='mb'>
              <span className="color-text" style={{ marginBottom: '15px', fontStyle: 'normal', color: '#ae8f3d' }}>LOGIN - CSS NISO</span>
              <Form name="login" onFinish={onFinish} className='box-sign-in' style={{ marginTop: '15px' }}>
                <Form.Item
                  name="Email"
                  rules={[{ required: true, message: t('cauhoi.Vui lòng nhập tên người dùng hoặc địa chỉ email!') }]}
                  style={{ marginBottom: 24, textAlign: 'left' }}
                >
                  <Input prefix={<UserOutlined style={{ color: '#ae8f3d' }} />} placeholder="Username or email address" size='large' className='custom__inputs' />
                </Form.Item>
                <Form.Item
                  name="Password"
                  rules={[{ required: true, message: t('cauhoi.Vui lòng nhập Mật khẩu !') }]}
                  style={{ marginBottom: 10, textAlign: 'left' }}
                >
                  <Input.Password prefix={<LockOutlined style={{ color: '#ae8f3d' }} />} placeholder="Password" size='large' className='custom__inputs' />
                </Form.Item>
                <Form.Item name="rememberPassword" valuePropName="checked" style={{ marginBottom: 0, float: 'left' }}>
                  <Checkbox style={{ float: 'left' }} defaultChecked={true} className='checkboxniso'>{t('cauhoi.Stay logged in')}</Checkbox>
                </Form.Item>
                <Form.Item style={{ margin: 0 }}>
                  <Button type="primary" htmlType="submit" loading={loading} size='large' style={{ width: '100%', marginBottom: 0 }} className='btn__login__niso'>
                    Sign in
                  </Button>
                </Form.Item>
                {/* <audio ref={audioRef} loop>
                  <source src={GiangSinh} type="audio/mp3" />
                  Trình duyệt của bạn không hỗ trợ phát âm thanh.
                </audio> */}
                <Language user={user} />
              </Form>
            </div>
            <img src={Background} alt="Ảnh bìa" className='background' />
          </div>
        </div>
      </Content>
      {/* <Button
        icon={isPlaying ? <SoundOutlined /> : <SoundOutlined style={{ color: '#d9d9d9' }} />}
        onClick={togglePlay}
        type='primary'
        className='btn__play__music'
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      /> */}
    </Layout>
  );
};

export default Login;
