import Layout from "@/components/Layout/Layout";
import styles from "./Contact.module.scss";
import PageHeader from "@/components/User/PageHeader/PageHeader";
import ContactForm from "@/components/User/ContactForm/ContactForm";

const Contact = () => {
  return (
    <>
      <PageHeader 
        title="Contact" 
        subtitle="want to say hi or have a question?" 
        secondarySubtitle="send me a message!"
      />
      <ContactForm />
    </>
  );
};

export default Contact;
