import PersonalInfoForm from './PersonalInfoForm.jsx';
import AboutMeForm from './AboutMeForm.jsx';
import EducationForm from './EducationForm.jsx';
import ExperienceForm from './ExperienceForm.jsx';
import LanguagesForm from './LanguagesForm.jsx';
import CertificationsForm from './CertificationsForm.jsx';
import SkillsForm from './SkillsForm.jsx';
import ProjectsForm from './ProjectsForm.jsx';
import VolunteerForm from './VolunteerForm.jsx';

export default function CVForm() {
  return (
    <form className="cv-form">
      <PersonalInfoForm />
      <AboutMeForm />
      <EducationForm />
      <ExperienceForm />
      <LanguagesForm />
      <CertificationsForm />
      <SkillsForm />
      <ProjectsForm />
      <VolunteerForm />
    </form>
  );
}
