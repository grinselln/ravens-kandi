import Button from "@/components/Input/Button/Button";
import styles from "./ContactForm.module.scss"
import InputText from '@/components/Input/InputText/InputText';
import InputTextArea from "@/components/Input/InputTextArea/InputTextArea";
import { useState } from 'react';

export default function ContactForm() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  return (
    <form method="POST" action="https://formsubmit.co/4a005f989176c3e97d68a7bc21e9d46e" encType="multipart/form-data">
      <input type="hidden" name="_next" value="http://localhost:5173/contact?success=true" />
      <input type="hidden" name="_replyto" value="email" />
      <input type="hidden" name="_subject" value="New submission!"></input>
      <input type="hidden" name="_template" value="table" />
      
      <div className={styles['form-wrapper']}>
        <div className={styles['form-row']}>
          <InputText
            label='Name'
            fieldWrapperClass='field-light'
            value={name}
            setValue={(name) => setName(name)}
            type="text"
            name="name"
          />
          <InputText
            label='E-mail'
            fieldWrapperClass='field-light'
            value={email}
            setValue={(email) => setEmail(email)}
            type="email"
            name="email"
          />
        </div>
        <div className={styles['form-row']}>
          <InputText
            label='Subject'
            fieldWrapperClass='field-light'
            value={subject}
            setValue={(subject) => setSubject(subject)}
            type="subject"
            name="subject"
          />
        </div>
        <div className={styles['form-row']}>
          <InputTextArea
            label='Message'
            fieldWrapperClass='field-light'
            value={subject}
            setValue={(subject) => setSubject(subject)}
            name="message"
          />
        </div>
        <Button onClick={() => {}} isDisabled={false} type="submit">Send</Button>
      </div>
  </form>
  );
}