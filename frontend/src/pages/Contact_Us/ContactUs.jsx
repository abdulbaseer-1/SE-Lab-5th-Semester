import contact_style from './ContactUs.module.css';
import Header from "../../components/Header/Header"
import Content from "../../components/content/Content";
import Footer from "../../components/Footer/Footer";
import student1 from "../../assets/ContactUs/Student-1.jpeg";
import student2 from "../../assets/ContactUs/Student-2.jpeg";
import student3 from "../../assets/ContactUs/Student-3.jpeg";
import github_logo from "../../assets/icons/github.png";

function ContactUs() {
  return(
    <>
      <Header/>
        <Content className={contact_style.contentBody}>
        <div>
            <h1>About Us</h1>
            <div className={contact_style.contact_container}>{/*flex with photos of me and my group members, description at the end */}
              <div className={contact_style.contact}>
                <img src={student1} alt="pic 1" />
                <h5> Abdul-Baseer</h5>
                <p>A hardworking Computer Science student tasked with making this semester project</p>
                <a href="https://github.com/abdulbaseer-1" target="_blank"><img src={github_logo} alt="github"/></a>
              </div>
              <div className={contact_style.contact}>
              <img src={student2} alt="pic 2" />
                <h5> M.Mohsin</h5>
                <p>A hardworking Computer Science student tasked with making this semester projectS</p>
                <a href="https://github.com/23pwbcs1019/23pwbcs1019-wp-f2024.git" target="_blank"><img src={github_logo} alt="github"/></a>
              </div>
              <div className={contact_style.contact}>
              <img src={student3} alt="pic 3" />
                <h5> Hooria Altaf</h5>
                <p>A hardworking Computer Science student tasked with making this semester project</p>
                <a href="https://github.com/abdulbaseer-1" target="_blank"><img src={github_logo} alt="github"/></a>
              </div>
              <div className={contact_style.contact}>
              <img src={student3} alt="pic 3" />
                <h5> Saad Abdullah</h5>
                <p>A hardworking Computer Science student tasked with making this semester project</p>
                <a href="https://github.com/abdulbaseer-1" target="_blank"><img src={github_logo} alt="github"/></a>
              </div>
            </div>
            <div className={contact_style.description}>
              <h3>Descrition:</h3>
              <p>Developed by a dedicated team (Abdul-Baseer, M. Mohsin, Hooria Altaf, and Saad Abdullah) this Accessibility Simulator offers an easy-to-use platform that promotes better, more inclusive web design through the simulation of various user conditions. With expertise in frontend development, backend integration, and UI design, we’ve created a secure and efficient service. Data privacy and security remain our top priorities in offering a trusted platform for the community.</p>
            </div>
          </div>
        </Content>
      <Footer/>
    </>
  );
}

export default ContactUs;