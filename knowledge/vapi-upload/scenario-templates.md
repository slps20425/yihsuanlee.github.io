# Scenario Templates & Examples

## Overview

This document contains all the scenario templates and examples that were previously in the Helper Buddy. The RAG chatbot can now suggest these dynamically based on user questions.

## Mouthpiece Service Templates

### 1. Lost Item Inquiry 🔍

**Use Case**: Calling a business to ask about a lost item

**Template**:
```
Hi, this is [Your Name] calling on behalf of [Recipient Name]. 

I'm calling to inquire about a lost item. [He/She] left [description of item, e.g., "a black backpack"] at your location on [date] around [time].

The item contains [important contents if any, e.g., "important documents and a laptop"].

Could you please check if it has been turned in to your lost and found? If found, [Recipient Name] can be reached at [phone number] or [email].

Thank you for your help!
```

**Example**:
```
Hi, this is John calling on behalf of Sarah Chen.

I'm calling to inquire about a lost item. She left a black leather backpack at your restaurant on January 15th around 7:30 PM.

The backpack contains a MacBook Pro and some important work documents.

Could you please check if it has been turned in to your lost and found? If found, Sarah can be reached at +1-555-0123 or sarah.chen@email.com.

Thank you for your help!
```

---

### 2. Business Hours Confirmation 🏪

**Use Case**: Verifying operating hours before visiting

**Template**:
```
Hello, this is [Your Name] calling on behalf of [Recipient Name].

[He/She] would like to confirm your business hours for [specific day, e.g., "this Saturday"].

Could you please let me know what time you open and close?

Also, are there any special hours or closures coming up that we should be aware of?

Thank you!
```

**Example**:
```
Hello, this is Mike calling on behalf of Lisa Wang.

She would like to confirm your business hours for this Saturday, January 20th.

Could you please let me know what time you open and close?

Also, are there any special hours or closures coming up that we should be aware of?

Thank you!
```

---

### 3. Package Tracking 📦

**Use Case**: Following up on a delivery or package

**Template**:
```
Hi, this is [Your Name] calling on behalf of [Recipient Name].

[He/She] is calling to check on the status of a package that was supposed to be delivered to [address] on [expected date].

The tracking number is [tracking number].

Could you please provide an update on where the package is and when it might arrive?

[Recipient Name] can be reached at [phone number] if you need any additional information.

Thank you!
```

**Example**:
```
Hi, this is Tom calling on behalf of Jennifer Lee.

She is calling to check on the status of a package that was supposed to be delivered to 123 Main Street, Apartment 4B on January 18th.

The tracking number is 1Z999AA10123456784.

Could you please provide an update on where the package is and when it might arrive?

Jennifer can be reached at +1-555-0199 if you need any additional information.

Thank you!
```

---

### 4. Event RSVP 🎉

**Use Case**: Confirming attendance or declining an invitation

**Template**:
```
Hello, this is [Your Name] calling on behalf of [Recipient Name].

[He/She] received an invitation to [event name] on [date] and would like to [confirm attendance / regretfully decline].

[If attending: How many guests will be attending: [number]]
[If declining: Unfortunately, [he/she] has a prior commitment and won't be able to make it.]

Please let me know if you need any additional information.

Thank you!
```

**Example (Accepting)**:
```
Hello, this is Emma calling on behalf of David Park.

He received an invitation to the Annual Charity Gala on February 14th and would like to confirm his attendance.

Two guests will be attending: David and his wife.

Please let me know if you need any additional information.

Thank you!
```

**Example (Declining)**:
```
Hello, this is Emma calling on behalf of David Park.

He received an invitation to the Annual Charity Gala on February 14th but regretfully needs to decline.

Unfortunately, he has a prior commitment and won't be able to make it.

Thank you for the invitation!
```

---

### 5. Repair Appointment 🔧

**Use Case**: Scheduling or confirming a repair service

**Template**:
```
Hi, this is [Your Name] calling on behalf of [Recipient Name].

[He/She] needs to schedule a repair for [item/service, e.g., "a washing machine"].

The issue is: [brief description of problem].

What is your earliest available appointment?

[Recipient Name] is available [days/times] and can be reached at [phone number].

Thank you!
```

**Example**:
```
Hi, this is Alex calling on behalf of Maria Rodriguez.

She needs to schedule a repair for her washing machine.

The issue is: it's making loud grinding noises during the spin cycle and not draining properly.

What is your earliest available appointment?

Maria is available weekday afternoons after 2 PM and can be reached at +1-555-0167.

Thank you!
```

---

### 6. Order Modification 📝

**Use Case**: Changing or canceling an existing order

**Template**:
```
Hello, this is [Your Name] calling on behalf of [Recipient Name].

[He/She] placed an order on [date] with order number [order number] and needs to make a change.

[Specify change: e.g., "add an item", "change delivery address", "cancel the order"]

The new [address/item/details] is: [details]

Can you please confirm this change has been made?

[Recipient Name] can be reached at [phone number] if you have any questions.

Thank you!
```

**Example**:
```
Hello, this is Chris calling on behalf of Robert Kim.

He placed an order on January 16th with order number #ORD-789456 and needs to make a change.

He needs to change the delivery address from 456 Oak Street to 789 Pine Avenue, Apartment 2C.

Can you please confirm this change has been made?

Robert can be reached at +1-555-0145 if you have any questions.

Thank you!
```

---

### 7. Emergency Notification 🚨

**Use Case**: Urgent message delivery

**Template**:
```
Hello, this is [Your Name] calling with an urgent message for [person's name].

[Recipient Name] asked me to relay the following important information:

[Urgent message - keep it brief and clear]

This is time-sensitive. Please have [person's name] call [Recipient Name] back immediately at [phone number].

Thank you for your help with this urgent matter.
```

**Example**:
```
Hello, this is Rachel calling with an urgent message for Dr. Johnson.

Sarah Williams asked me to relay the following important information:

Her father has been admitted to St. Mary's Hospital and she needs to speak with Dr. Johnson about rescheduling tomorrow's appointment.

This is time-sensitive. Please have Dr. Johnson call Sarah back immediately at +1-555-0198.

Thank you for your help with this urgent matter.
```

---

### 8. Schedule Verification 📅

**Use Case**: Confirming an appointment or reservation

**Template**:
```
Hi, this is [Your Name] calling on behalf of [Recipient Name].

[He/She] has an appointment scheduled for [date] at [time] and would like to confirm it's still on the books.

[Optional: If there are any changes needed, mention them here]

Could you please verify this appointment is confirmed?

Thank you!
```

**Example**:
```
Hi, this is Kevin calling on behalf of Amanda Chen.

She has a dental appointment scheduled for January 22nd at 2:30 PM and would like to confirm it's still on the books.

Could you please verify this appointment is confirmed?

Thank you!
```

---

### 9. Stock Inquiry 📊

**Use Case**: Checking product availability

**Template**:
```
Hello, this is [Your Name] calling on behalf of [Recipient Name].

[He/She] is interested in purchasing [product name/description] and would like to know if you have it in stock.

[Optional: Specific details like size, color, model number]

If it's available, could you please let me know the price and if it can be held for pickup?

[Recipient Name] can be reached at [phone number].

Thank you!
```

**Example**:
```
Hello, this is Nicole calling on behalf of James Park.

He is interested in purchasing the Sony WH-1000XM5 wireless headphones in black and would like to know if you have them in stock.

If they're available, could you please let me know the price and if they can be held for pickup?

James can be reached at +1-555-0176.

Thank you!
```

---

## Restaurant Reservation Examples

### Standard Reservation

**Template**:
```
Hello, I'd like to make a reservation for [party size] people on [date] at [time].

The name for the reservation is [name].

[Optional: Special requests like "We'd prefer a quiet table" or "One person has a wheelchair"]

Could you please confirm this reservation?

Thank you!
```

**Example**:
```
Hello, I'd like to make a reservation for 4 people on Saturday, January 25th at 7:00 PM.

The name for the reservation is Chen.

We'd prefer a table near the window if possible, and one person in our party has a gluten allergy.

Could you please confirm this reservation?

Thank you!
```

---

### Special Occasion Reservation

**Template**:
```
Hello, I'd like to make a reservation for [party size] people on [date] at [time].

This is for a special occasion - [birthday/anniversary/celebration].

The name for the reservation is [name].

[Optional: Special requests like "Could we have a cake brought out?" or "Is there a private dining area available?"]

Thank you!
```

**Example**:
```
Hello, I'd like to make a reservation for 6 people on Friday, February 14th at 8:00 PM.

This is for a special occasion - my wife's 40th birthday.

The name for the reservation is Martinez.

Could we have a corner table, and is it possible to bring in our own birthday cake?

Thank you!
```

---

## Trial Service Examples

### Phone Number Test

**Script**:
```
Hello, this is a test call to verify this phone number is working correctly. If you receive this message, the number is active. Thank you!
```

### AI Quality Test

**Script**:
```
Hello, this is an AI voice quality test. I'm calling to verify the clarity and naturalness of the AI voice system. This is a test message. If you can hear this clearly, the system is functioning properly. Thank you for your patience!
```

---

## Best Practices

### Do's ✅
- **Be clear and concise** - Get to the point quickly
- **Include all necessary details** - Name, date, contact info
- **Be polite and professional** - Use "please" and "thank you"
- **Provide callback information** - Phone number or email
- **State the purpose upfront** - Don't make them guess

### Don'ts ❌
- **Don't ramble** - Keep it under 200 words
- **Don't use jargon** - Speak in plain language
- **Don't forget contact info** - Always provide a way to reach back
- **Don't be vague** - Specific dates, times, and details
- **Don't use multiple requests** - One clear objective per call

---

## How the Chatbot Uses These Templates

When a user asks the chatbot:

**User**: "How do I write a script for a lost item?"

**Chatbot**: 
> I can help! Here's a template for lost item inquiries:
> 
> [Shows Lost Item template]
> 
> **Pro Tips**:
> - Include specific details (color, brand, location)
> - Mention the date and time
> - Provide multiple contact methods
> 
> Would you like me to help you customize this template?

---

**User**: "What's a good example for calling about a package?"

**Chatbot**:
> Here's a package tracking example:
> 
> [Shows Package Tracking example]
> 
> **Key elements to include**:
> - Tracking number
> - Expected delivery date
> - Delivery address
> - Your contact information
> 
> Need help writing your specific script?

---

## Integration with RAG Chatbot

These templates are now part of the knowledge base and will be:
1. **Embedded in the vector database**
2. **Suggested contextually** by the chatbot
3. **Customizable** through conversation
4. **Always up-to-date** (can be edited in this file)

---

**Last Updated**: 2026-01-19  
**Source**: Migrated from Helper Buddy UI
