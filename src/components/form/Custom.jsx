import { message } from 'antd';
import GoodyLogo from '../../asset/Goody.svg';
import RunamDorLogo from '../../asset/RUNAMDOR.svg';
import RunamLogo from '../../asset/RUNAM.svg';
import CiaoLogo from '../../asset/Ciao.svg';
import ThanhnienLogo from '../../asset/Thanh_nien.svg';
import NisoLogo from '../../asset/Logo.svg';

const BRAND_STYLES = {
  'RuNam': {
    h2: 'runam__h2',
    h1: 'runam__h1',
    logo: RunamLogo,
    className: 'custom-search-button',
    input: 'ant-input-runam',
    question: 'qt1__runam',
    question2: 'qtq__runam',
    draw: '#c3ac7c',
    rate: 'custom-rate',
    colorRate: 'RateColor__runam',
    checkbox: 'radio__runame',
    modal: 'Modal__runam',
    question3: 'qt3__runam',
    select: 'slrn',
    ranger: 'rangerrn',
    metions: 'metionsrn',
    tablecolor: 'table__runam',
    tablecolor2: 'table__runam2',
    tabs: 'tabsrn',
    popup: 'popuprunam',
    colorTabs: 'colorrunam',
    pagination: 'pagination__runam',
  },
  'RuNam D\'or': {
    h2: 'runam__h2',
    h1: 'runam__h1',
    logo: RunamDorLogo,
    className: 'custom-search-button',
    input: 'ant-input-runam',
    question: 'qt1__runam',
    question2: 'qtq__runam',
    draw: '#c3ac7c',
    rate: 'custom-rate',
    colorRate: 'RateColor__runam',
    checkbox: 'radio__runame',
    modal: 'Modal__runam',
    question3: 'qt3__runam',
    select: 'slrn',
    ranger: 'rangerrn',
    metions: 'metionsrn',
    tablecolor: 'table__runam',
    tablecolor2: 'table__runam2',
    tabs: 'tabsrn',
    popup: 'popuprunam',
    colorTabs: 'colorrunam',
    pagination: 'pagination__runam',
  },
  'Goody': {
    h2: 'goody__h2',
    h1: 'goody__h1',
    logo: GoodyLogo,
    className: 'custom-Goody-button',
    input: 'ant-input-goody',
    question: 'qt1__goody',
    question2: 'qt1__goody',
    draw: 'rgb(229, 255, 202)',
    rate: 'custom-rate-goody',
    colorRate: 'RateColor__goody',
    checkbox: 'radio__goody',
    modal: 'Modal__goody',
    question3: 'qt3__goody',
    select: 'slgd',
    ranger: 'rangergd',
    metions: 'metionsgoody',
    tablecolor: 'table__ciao',
    tablecolor2: 'table__ciao',
    tabs: 'tabsCiao',
    popup: 'popupciao',
    colorTabs: 'colorciao',
    pagination: 'pagination__goody',
  },
  'Ciao Cafe': {
    h2: 'ciao__h2',
    h1: 'ciao__h1',
    logo: CiaoLogo,
    className: 'custom-ciao-button',
    input: 'ant-input-ciao',
    question: 'qt1__ciao',
    question2: 'qt1__ciao',
    draw: 'rgb(252, 244, 229)',
    rate: 'custom-rate-ciao',
    colorRate: 'RateColor__ciao',
    checkbox: 'radio_ciao',
    modal: 'Modal__ciao',
    question3: 'qt3__ciao',
    select: 'slciao',
    ranger: 'rangerciao',
    metions: 'metionsgoody',
    tablecolor: 'table__ciao',
    tablecolor2: 'table__ciao',
    tabs: 'tabsCiao',
    popup: 'popupciao',
    colorTabs: 'colorciao',
    pagination: 'pagination__ciao',
  },
  'Nhà hàng Thanh Niên': {
    h2: 'nhtn__h2',
    h1: 'nhtn__h1',
    logo: ThanhnienLogo,
    className: 'custom-nhtn-button',
    input: 'ant-input-nhtn',
    question: 'qt1__nhtn',
    question2: 'qt1__nhtn',
    draw: '#fff8fe',
    rate: 'custom-rate-nhtn',
    colorRate: 'RateColor__nhtn',
    checkbox: 'radio_nhtn',
    modal: 'Modal__nhtn',
    question3: 'qt3__nhtn',
    select: 'slnhtn',
    ranger: 'rangernhtn',
    metions: 'metionsnhtn',
    tablecolor: 'table__nhtn',
    tablecolor2: 'table__nhtn',
    tabs: 'tabsnhtn',
    popup: 'popupnhtn',
    colorTabs: 'colornhtn',
    pagination: 'pagination__nhtn',
  },
  'Niso': {
    h2: 'niso__h2',
    h1: 'niso__h1',
    logo: NisoLogo,
    className: 'custom-niso-button',
    input: 'ant-input-niso',
    question: 'qt1__niso',
    question2: 'qt1__niso',
    draw: '#fff7dd',
    rate: 'custom-rate-niso',
    colorRate: 'RateColor__niso',
    checkbox: 'radio__niso',
    modal: 'Modal__niso',
    question3: 'qt3__niso',
    select: 'slniso',
    ranger: 'rangerniso',
    metions: 'metionsniso',
    tablecolor: 'table__niso',
    tablecolor2: 'table__niso',
    tabs: 'tabsniso',
    popup: 'popupniso',
    colorTabs: 'colorniso',
    pagination: 'pagination__niso',
  },
};

export const geth2 = (brandName) => BRAND_STYLES[brandName]?.h2 || '';
export const geth1 = (brandName) => BRAND_STYLES[brandName]?.h1 || '';
export const getLogo = (brandName) => {
  const logo = BRAND_STYLES[brandName]?.logo;
  if (!logo) message.warning('Logo trống');
  return logo || null;
};
export const getClassName = (brandName) => BRAND_STYLES[brandName]?.className || '';
export const getInput = (brandName) => BRAND_STYLES[brandName]?.input || '';
export const getquestion = (brandName) => BRAND_STYLES[brandName]?.question || '';
export const getquestion2 = (brandName) => BRAND_STYLES[brandName]?.question2 || '';
export const getDraw = (brandName) => BRAND_STYLES[brandName]?.draw || '';
export const getRate = (brandName) => BRAND_STYLES[brandName]?.rate || '';
export const getColorRate = (brandName) => BRAND_STYLES[brandName]?.colorRate || '';
export const getCheckbox = (brandName) => BRAND_STYLES[brandName]?.checkbox || '';
export const getModal = (brandName) => BRAND_STYLES[brandName]?.modal || '';
export const getQuestion3 = (brandName) => BRAND_STYLES[brandName]?.question3 || '';
export const getSelect = (brandName) => BRAND_STYLES[brandName]?.select || '';
export const getRanger = (brandName) => BRAND_STYLES[brandName]?.ranger || '';
export const getMetions = (brandName) => BRAND_STYLES[brandName]?.metions || '';
export const getTableColor = (brandName) => BRAND_STYLES[brandName]?.tablecolor || '';
export const getTableColor2 = (brandName) => BRAND_STYLES[brandName]?.tablecolor2 || '';
export const getTabs = (brandName) => BRAND_STYLES[brandName]?.tabs || '';
export const getPopup = (brandName) => BRAND_STYLES[brandName]?.popup || '';
export const getColorTabs = (brandName) => BRAND_STYLES[brandName]?.colorTabs || '';
export const getPagination = (brandName) => BRAND_STYLES[brandName]?.pagination || '';