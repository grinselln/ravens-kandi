import Layout from "@/components/Layout/Layout";
import PageHeader from "@/components/User/PageHeader/PageHeader";
import ContactForm from "@/components/User/ContactForm/ContactForm";

const Contact = () => {
  return (
    <Layout>
      <PageHeader 
        title="Contact" 
        subtitle="want to say hi or have a question?" 
        secondarySubtitle="send me a message!"
      />
      <ContactForm />
    </Layout>
  );
};

export default Contact;
