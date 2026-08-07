import Button from "@/components/Input/Button/Button";
import styles from "./ContactForm.module.scss"
import InputText from '@/components/Input/InputText/InputText';
import InputTextArea from "@/components/Input/InputTextArea/InputTextArea";
import { useEffect, useMemo, useState } from 'react';

export default function ContactForm() {
  const redirectUrl = window.location.origin + window.location.pathname;

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [errors, setErrors] = useState<any>({
    validName: false,
    validEmail: false,
    validSubject: false,
    validMessage: false
  });

  const onCheckErrors = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; 

    setErrors({
      validName: name !== "",
      validEmail: emailRegex.test(email),
      validSubject: subject !== "",
      validMessage: message !== ""
    })
  }

  const isSendDisabled = useMemo(() => {
    return !errors.validName || !errors.validEmail || !errors.validSubject || !errors.validMessage;
  }, [name, email, subject, message]);

  useEffect(() => {
    const form = document.getElementById('contactForm');

    if(form) {

      const handleSubmit = (event: any) => {
        if(isSendDisabled) {
          event.preventDefault();
        }
      }

      form.addEventListener('submit', handleSubmit);
  
      return () => {
        window.removeEventListener("submit", handleSubmit);
      };
    }
  }, []);

  return (
    <form id='contactForm' method="POST" action="https://formsubmit.co/4a005f989176c3e97d68a7bc21e9d46e" encType="multipart/form-data">
      <input type="hidden" name="_next" value={`${redirectUrl}?success=true`} />
      <input type="hidden" name="_replyto" value="email" />
      <input type="hidden" name="_subject" value="New submission!"></input>
      <input type="hidden" name="_template" value="table" />
      
      <div className={styles['form-wrapper']}>
        <div className={styles['form-row']}>
          <InputText
            label='Name'
            wrapperClass={!errors.validName ? "error" : ""}
            fieldWrapperClass='field-light'
            value={name}
            setValue={(name) => setName(name)}
            type="text"
            name="name"
            onBlur={() => onCheckErrors()}
          />
          <InputText
            label='E-mail'
            wrapperClass={!errors.validEmail ? "error" : ""}
            fieldWrapperClass='field-light'
            value={email}
            setValue={(email) => setEmail(email)}
            type="email"
            name="email"
            onBlur={() => onCheckErrors()}
          />
        </div>
        <div className={styles['form-row']}>
          <InputText
            label='Subject'
            wrapperClass={!errors.validSubject ? "error" : ""}
            fieldWrapperClass='field-light'
            value={subject}
            setValue={(subject) => setSubject(subject)}
            type="subject"
            name="subject"
            onBlur={() => onCheckErrors()}
          />
        </div>
        <div className={styles['form-row']}>
          <InputTextArea
            label='Message'
            fieldWrapperClass='field-light'
            wrapperClass={!errors.validMessage ? "error" : ""}
            value={message}
            setValue={(message) => setMessage(message)}
            name="message"
            onBlur={() => onCheckErrors()}
          />
        </div>
        <Button onClick={() => {}} isDisabled={isSendDisabled} type="submit">Send</Button>
      </div>
  </form>
  );
}