import classNames from 'classnames/bind';
import styles from './SlideHome.module.scss';

import { Swiper, SwiperSlide } from 'swiper/react';

import { EffectFade, Navigation, Pagination, Autoplay } from 'swiper/modules';

import Banner1 from '../../../assets/images/banner1.jpg';
import Banner2 from '../../../assets/images/banner2.jpg';
import Banner3 from '../../../assets/images/banner3.jpg';
import Banner4 from '../../../assets/images/banner4.jpg';
import Banner5 from '../../../assets/images/banner5.jpg';
import Banner6 from '../../../assets/images/banner6.jpg';

const cx = classNames.bind(styles);

const banners = [
    { id: 1, image: Banner1 },
    { id: 2, image: Banner2 },
    { id: 3, image: Banner3 },
    { id: 4, image: Banner4 },
    { id: 5, image: Banner5 },
    { id: 6, image: Banner6 },
];

function SlideHome() {
    return (
        <div className={cx('wrapper')}>
            <Swiper
                slidesPerView={1}
                autoplay={{
                    delay: 2000,
                    disableOnInteraction: false,
                }}
                loop={true}
                speed={1000}
                spaceBetween={30}
                effect={'fade'}
                navigation={true}
                pagination={{
                    clickable: true,
                }}
                modules={[EffectFade, Navigation, Pagination, Autoplay]}
                className="mySwiper"
            >
                {banners.map((banner) => (
                    <SwiperSlide key={banner.id}>
                        <img
                            id={cx('banner-image')}
                            src={banner.image}
                            alt={`Banner ${banner.id}`}
                        />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
}

export default SlideHome;
