import { motion } from "framer-motion";
import { Award, BookOpen, GraduationCap, Heart } from "lucide-react";
import sujoyImg from "@/assets/sujoy-sir.png";

const About = () => {
  return (
    <div className="min-h-screen py-10 sm:py-16">
      <div className="container max-w-3xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto h-24 w-24 overflow-hidden rounded-full bg-muted shadow-lg ring-4 ring-primary/20 sm:h-32 sm:w-32">
            <img src={sujoyImg} alt="Sujoy Sir" className="h-full w-full object-cover" />
          </div>
          <h1 className="mt-4 font-bengali text-2xl font-bold text-foreground sm:mt-6 sm:text-3xl">Sujoy Sir</h1>
          <p className="mt-1 font-bengali text-base text-primary sm:text-lg">জ্ঞানচর্চা'লয়</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-3 sm:gap-4"
        >
          {[
            { icon: <GraduationCap className="h-5 w-5" />, label: "Senior Teacher" },
            { icon: <BookOpen className="h-5 w-5" />, label: "Content Creator" },
            { icon: <Award className="h-5 w-5" />, label: "SSC & HSC Specialist" },
          ].map((item) => (
            <div key={item.label} className="card-elevated flex items-center gap-3 rounded-xl bg-card p-3.5 sm:p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-10 sm:w-10">
                {item.icon}
              </div>
              <span className="text-xs font-medium text-card-foreground sm:text-sm">{item.label}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-elevated mt-8 rounded-xl bg-card p-5 sm:mt-10 sm:p-8"
        >
          <div className="flex items-center gap-2 text-primary">
            <Heart className="h-5 w-5" />
            <h2 className="text-base font-semibold sm:text-lg">Personal Message</h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:mt-4">
            শিক্ষা মানুষের সবচেয়ে বড় সম্পদ। আমি বিশ্বাস করি প্রতিটি ছাত্র-ছাত্রীর মধ্যে অসীম সম্ভাবনা রয়েছে।
            সঠিক দিকনির্দেশনা এবং নিষ্ঠার সাথে পড়াশোনা করলে যেকোনো লক্ষ্য অর্জন সম্ভব।
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:mt-3">
            জ্ঞানচর্চা'লয়-এর মাধ্যমে আমি চেষ্টা করি মানসম্মত শিক্ষামূলক কন্টেন্ট সকলের কাছে পৌঁছে দিতে।
            তোমাদের সাফল্যই আমার অনুপ্রেরণা।
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
