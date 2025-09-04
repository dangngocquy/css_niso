import React, { useMemo, useState, useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { Layout } from 'antd';
import Right from '../asset/hoaphai.png';
import Left from '../asset/hoatrai.png';
import axios from 'axios';
import styled from 'styled-components';
import background from '../asset/background.webp';
import ciaoBackground from '../asset/Web_CIAO.svg';
import nhtnBackground from '../asset/Web_Thanh_Nien.svg';
import goodyBackground from '../asset/Web_Goody.svg';
// import NisoBackground from '../asset/Logo.svg.svg';

const BRAND_CLASSNAMES = {
  'RuNam': 'container-layout',
  "RuNam D'or": 'container-layout',
  'Goody': 'container-Goody',
  'Ciao Cafe': 'container-layout_Ciao',
  'Nhà hàng Thanh Niên': 'container-layout__nhtn',
  'Niso': 'container-layout__niso'
};

const StyledLayout = styled(Layout)`
  &.container-layout {
    background-image: url(${background});
    margin: 0 auto;
    background-size: cover;
    position: relative;
    z-index: 1;
    background-repeat: repeat;
    background-position: center;
  }

  &.container-layout_Ciao {
    background-image: url(${ciaoBackground});
    margin: 0 auto;
    background-size: cover;
    position: relative;
    z-index: 1;
    background-repeat: no-repeat;
    background-position: center;
  }

  &.container-layout__nhtn {
    background-image: url(${nhtnBackground});
    margin: 0 auto;
    background-size: cover;
    position: relative;
    z-index: 1;
    background-repeat: no-repeat;
    background-position: center;
  }

  &.container-Goody {
    background-image: url(${goodyBackground});
    margin: 0 auto;
    background-size: cover;
    position: relative;
    z-index: 1;
    background-repeat: repeat;
    background-position: center;
  }

  &.container-layout__niso {
    background-color: #fff7dd;
    margin: 0 auto;
    background-size: cover;
    position: relative;
    z-index: 1;
    background-repeat: repeat;
    background-position: center;
  }
`;

const HIDDEN_IMAGE_BRANDS = ['Ciao Cafe', 'Goody', 'Nhà hàng Thanh Niên', 'Niso'];

const Container = ({ user }) => {
  const { id } = useParams();
  const [brandName, setBrandName] = useState(user.BrandName);

  useEffect(() => {
    const fetchView = async () => {
      if (id) {
        try {
          const response = await axios.get(`/views/${id}`, {
            headers: {
              'Authorization': `Basic ${btoa(process.env.REACT_APP_BASIC_AUTH_USERNAME)}`
            }
          });
          if (response.data.success) {
            setBrandName(response.data.data.brandName);
          }
        } catch (error) {
          console.error('Lỗi khi tải view:', error);
        }
      }
    };

    fetchView();
  }, [id]);

  const className = useMemo(() => BRAND_CLASSNAMES[brandName] || '', [brandName]);
  const showImages = useMemo(() => !HIDDEN_IMAGE_BRANDS.includes(brandName), [brandName]);

  return (
    <div>
      <StyledLayout className={className}>
        {showImages && (
          <>
            <img src={Right} alt='Nền phải' className='right__niso' />
            <img src={Left} alt='Nền trái' className='left__niso' />
          </>
        )}
        <Outlet context={user} />
      </StyledLayout>
    </div>
  );
};

export default Container;
