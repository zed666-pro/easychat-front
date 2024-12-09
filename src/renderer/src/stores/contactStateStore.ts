import { defineStore } from "pinia";
import { ref } from 'vue'
export const useContactStateStore = defineStore('contactStateInfo', ()=>{
  const contactReload = ref();
  const delContactId = ref();


  const setContactReload = (state) =>{
    contactReload.value = state;
  }

  const delContact = (contactId) =>{
    delContactId.value = contactId;
  }

  return {contactReload,delContactId, delContact,setContactReload}
})
