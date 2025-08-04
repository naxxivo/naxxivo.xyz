


import { Ailment } from '../types';
import { BeakerIcon, SunIcon, UserIcon, FireIcon, FaceSmileIcon, LightBulbIcon } from '@heroicons/react/24/solid';

export const ailments: Ailment[] = [
  {
    id: 'common-cold-fever',
    name: "Cold & Fever",
    icon: FireIcon,
    description: "Remedies for common cold, runny nose, mild fever, and body aches.",
    pharmaceuticalRemedies: [
      { name: 'Paracetamol', description: 'A widely used medication to reduce fever and body aches. Follow dosage instructions.' },
      { name: 'Antihistamine', description: 'Helps reduce runny nose and allergy symptoms. E.g., Cetirizine.' },
      { name: 'Nasal Decongestant', description: 'Sprays or drops can be used to clear a blocked nose.' },
    ],
    homeRemedies: [
      { name: 'Ginger Tea', description: 'Boil grated ginger in hot water, add honey and lemon. Soothes a sore throat and relieves cold.' },
      { name: 'Steam Inhalation', description: 'Inhaling steam from a bowl of hot water can help clear nasal congestion.' },
      { name: 'Rest & Hydration', description: 'Get adequate rest and drink plenty of fluids like water and soup to help your body recover faster.' },
      { name: 'Honey', description: 'Honey has antibacterial properties that can help soothe a cough.' },
    ],
  },
  {
    id: 'headache',
    name: "Headache",
    icon: LightBulbIcon,
    description: "Simple solutions for common headaches or tension-related pain.",
    pharmaceuticalRemedies: [
      { name: 'Paracetamol', description: 'An effective and safe pain reliever for most types of headaches.' },
      { name: 'Ibuprofen', description: 'Can be effective for headaches caused by inflammation. Consult a doctor.' },
      { name: 'Pain Relief Balm', description: 'Gently massaging a pain relief balm on the forehead and temples can provide relief.' },
    ],
    homeRemedies: [
      { name: 'Ginger', description: 'Drinking ginger tea or chewing on a small piece of ginger can help reduce headache pain.' },
      { name: 'Cold Compress', description: 'Applying an ice pack wrapped in a cloth to your forehead can help numb the area and reduce pain.' },
      { name: 'Adequate Sleep', description: 'Lack of sleep is a common trigger for headaches. Try to get some rest in a quiet environment.' },
      { name: 'Hydration', description: 'Dehydration is a common cause of headaches. Drink plenty of water.' },
    ],
  },
  {
    id: 'cough',
    name: "Cough",
    icon: UserIcon,
    description: "Some home and general remedies for dry or productive coughs.",
    pharmaceuticalRemedies: [
      { name: 'Cough Syrup', description: 'Use the correct type of cough syrup based on whether your cough is dry or productive (with phlegm).' },
      { name: 'Lozenges', description: 'Can help soothe a scratchy throat and provide temporary relief.' },
    ],
    homeRemedies: [
      { name: 'Honey & Lemon Juice', description: 'Mix a spoonful of honey with a few drops of lemon juice to soothe a cough and sore throat.' },
      { name: 'Saltwater Gargle', description: 'Gargling with warm salt water can reduce throat inflammation and provide relief.' },
      { name: 'Basil Leaves (Tulsi)', description: 'Chewing on basil leaves or drinking tulsi tea can help alleviate coughing.' },
      { name: 'Turmeric Milk', description: 'Drinking warm milk with a pinch of turmeric acts as a natural antibiotic.' },
    ],
  },
  {
    id: 'stomach-ache',
    name: "Stomach Ache",
    icon: FaceSmileIcon,
    description: "Remedies for stomach pain due to gas, indigestion, or common causes.",
    pharmaceuticalRemedies: [
      { name: 'Antacid', description: 'Provides quick relief from stomach pain caused by gas or acidity.' },
      { name: 'Simethicone', description: 'Helps reduce bloating and gas in the stomach.' },
    ],
    homeRemedies: [
      { name: 'Cumin Water', description: 'Boil a teaspoon of cumin seeds in a glass of water, let it cool, and drink it to relieve gas.' },
      { name: 'Mint Leaves', description: 'Chewing on mint leaves can help with indigestion and cool the stomach.' },
      { name: 'Ginger', description: 'Ginger can help reduce stomach pain and improve digestion.' },
      { name: 'Yogurt', description: 'The probiotics in yogurt can aid digestion and promote a healthy gut.' },
    ],
  },
];