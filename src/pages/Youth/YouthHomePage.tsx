import YouthHero from '../../components/Youth/YouthHero';
import YouthStats from '../../components/Youth/YouthStats';
import HomeFeatures from '../../components/Youth/HomeFeatures';
import HomeAbout from '../../components/Youth/HomeAbout';
import HomeCrew from '../../components/Youth/HomeCrew';
import HomeLeadership from '../../components/Youth/HomeLeadership';
import HomeBlog from '../../components/Youth/HomeBlog';
import HomeTestimonial from '../../components/Youth/HomeTestimonial';

const YouthHomePage = () => {
  return (
    <>
      <YouthHero />
      <YouthStats />
      <HomeFeatures />
      <HomeAbout />
      <HomeCrew />
      <HomeLeadership />
      <HomeBlog />
      <HomeTestimonial />
    </>
  );
};

export default YouthHomePage;