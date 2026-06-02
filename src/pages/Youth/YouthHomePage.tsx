import SEO from '../../components/SEO';
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
      <SEO title="Youth Community" description="Global Flame Ministry Youth Community — raising a generation of passionate believers. Join us for events, activities, and fellowship." url="https://globalflameministry.org/youth" />
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