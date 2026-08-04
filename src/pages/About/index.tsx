import Button from '@/components/Input/Button/Button';
import styles from './About.module.scss'
import Layout from "@/components/Layout/Layout";
import PageHeader from "@/components/User/PageHeader/PageHeader";
import { Link } from 'react-router-dom';


const About = () => {
  return (
    <Layout>
      <PageHeader 
        title="About Me" 
        subtitle="how making kandi & perlers" 
        secondarySubtitle="became an integrated part of my life"
      />
      <div className={styles.intro}>
        <img src="images/about/profile.png" alt="profile picture"/>
        <h2>I'm Raven.</h2>
        <p>Kandi become a passion that I never expected. It started with EDCO 2021. I knew nothing about kandi or PLUR. But I wanted to come into the event understanding the culture behind it. And I instantly fell in love with it and the concept of kandi. Having the ability to give a bit of genuine kindness with no expectations hits close to my heart. It&apos;s been over 5 years and I haven&apos;st stop. In fact I&apos;sve only expanded farther, taking kandi outside of EDC and festivals entirely.</p>
        <p>It&apos;s always special to receive something back, but, I give kandi and perlers, just to give kandi and perlers. They are a complete stranger. But we share a moment, a dance, an emotion, a compliment. We share a connection. And that gets to be saved in a physical item. That seems so special to me.</p>
        <p>The world is better with unexpected acts of kindness. And so kandi isn&apos;st just something I like to make. It&apos;s not just an expression of my interests or aesthetic. It&apos;s not just a way to push myself out of my comfort zone with strangers.</p>
        <p>It&apos;s my <span>art of connection.</span></p>
      </div>
      <PageHeader 
        title="The History" 
        subtitle="where my passion started" 
        secondarySubtitle="and how it got to where it is today"
      />
      <div className={`${styles['history-entry']} grid`}>
        <div className={`${styles['entry']} col col-md-6`}>
          <h3>01 - Where it started</h3>
          <h2>EDCO</h2>
          <p>My first EDC was in 2021. Going had been a want of mine for a couple of years, but being a college student I had some financial restraints. I enjoyed EDM but knew next to nothing about the culture itself. But, finally, attending was possible, so I began to research. I learned about PLUR. I learned about the values of self expression. I learned about kandi and how to trade it.</p>
          <p>I bought some variety pony bead packs and some string and started making bracelets. Some were vaguely themed. Some were color patterns. I was more or less making whatever came into my head, there wasn&apos;t a ton of cohesion. But I was having fun.</p>
          <p>Day 1 of the festival finally came. I was speechless at the amount of production put into the stages. I admired the different types of people and their outfits. I took everything in. Soon enough I had my first trade and I was hooked. The interaction was so pure and genuine, I truly felt the connection. It was like nothing else I had experienced. Kandi immediately became something I was bonded with.</p>
        </div>
        <div className={`${styles['images']} col col-md-6`}>
          <div className={`grid ${styles['edco-pull-spacing']}`}>
            <div className={`${styles['edco-push-top']} ${styles.gap} col-4`}>
              <img src="images/about/edco/group.png" alt="edco picture"/>
              <img src="images/about/edco/clefairy.png" className={styles['grid-img-unset-ratio']} alt="edco picture"/>
            </div>
            <div className='col-8'>
              <div className='grid'>
                <div className='col'>
                  <img src="images/about/edco/owl.png" className={styles['grid-img-5-2']} alt="edco picture"/>
                </div>
                <div className='col'>
                  <div className='grid'>
                    <div className='col-6'>
                      <img src="images/about/edco/stage.png" className={styles['grid-img-unset-ratio']} alt="edco picture"/>
                    </div>
                    <div className={`${styles.gap} col-6`}>
                      <img src="images/about/edco/charizard.png" className={styles['edco-pull-right']} alt="edco picture"/>
                      <img src="images/about/edco/skeleton.png" alt="edco picture"/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={`${styles['history-entry']} ${styles['inverse-entry']} grid`}>
        <div className={`${styles['entry']} col col-md-6`}>
          <h3>02 - Branching Out</h3>
          <h2>New Festivals</h2>
          <p>After a few years enjoying EDCO and the general festival experience, my best friend and I began looking at other festivals. I had attended Rockville in 2015 and 2016 when it was still in Jacksonville (rain or shine!). So I offered it up as a possibility, and not soon after, we had tickets for Rockville 2024.</p>
          <p>And I took my kandi with me, repping that ‘alt’ aesthetic. It was just as fun giving them away. Maybe even a little bit more. People had very little knowledge of kandi. So the excitement I saw when they randomly received a bracelet was infectious. We’ve attended Rockville every year since then. Rockville 2025 marked a milestone for me. It was the first time I made perlers to give away. It was very significant for me because some took hours to do. I waited for those very special connections and gave them a home. I had such wonderful memories doing this, I’ve carried to each future festival.</p>
          <p>2025 marked the return of Warped Tour - conveniently placed in Orlando. Of course we had to go. Kandi came with some perler keychains. It was a pleasant surprise that kandi was more common here than at Rockville. It just reinforced to me how versatile kandi can be. It was not something reserved for just one festival.</p>
          <p>2026 welcomed Earth Day Birth Day. One of the best parts of making band specific perlers is even if it doesn’t find a home right away, there’s a good chance we’ll see the band again. And that happened here. I got to give my huge Three Days Grace perler to a sweet older couple singing their lungs out to every song.</p>
        </div>
        <div className={`${styles['images']} ${styles['festival-pull-right-spacing']} col col-md-6`}>
          <div className={`grid`}>
            <div className={`${styles.gap} col`}>
              <img src="images/about/festivals/rockville.png" className={styles['grid-img-5-2']} alt="festival picture"/>
            </div>
          </div>
          <div className={`grid ${styles['festival-pull-right']}`}>
            <div className={`${styles.gap} col-6`}>
               <img src="images/about/festivals/warpedTour.png" className={styles['grid-img-unset-ratio']} alt="festival picture"/>
              </div>
            <div className='col-4'>
              <img src="images/about/festivals/edbd.png" alt="festival picture"/>
            </div>
          </div>
          <div className='grid'>
            <div className='col-4 col-md-3'>
              <img src="images/about/festivals/bmth.png" alt="festival picture"/>
            </div>
            <div className={`col-4 col-md-4`}>
              <img src="images/about/festivals/outfit.png" alt="festival picture"/>
            </div>
            <div className={`col-4 col-md-5`}>
              <img src="images/about/festivals/mcr.png" alt="festival picture"/>
            </div>
          </div>
        </div>
      </div>
      <div className={styles['condensed-history-entry']}>
        <h2>Concerts</h2>
        <div className={styles['entry']}>
          <div className={styles['img-block']}>
            <img src="images/about/concerts/bands_1.png" alt="band logo picture"/>
            <img src="images/about/concerts/bands_2.png" alt="band logo picture"/>
          </div>
          <p>Standalone concerts naturally also became a staple in kandi creation. To the point I began to make extras for my friend so she could participate and give them out as well. Kandi kept bleeding into different facets of my life and I had no intentions of stopping it.</p>
          <div className={styles['img-block']}>
            <img src="images/about/concerts/bands_3.png" alt="band logo picture"/>
            <img src="images/about/concerts/bands_4.png" alt="band logo picture"/>
          </div>
        </div>
      </div>
      <div className={`${styles['history-entry']} grid`}>
        <div className={`${styles['entry']} col col-md-6`}>
          <h3>03 - Finding My People</h3>
          <h2>Themed Nights</h2>
          <p>After a decade of dampening my aesthetic while watching events pass by, I’ve gotten to embrace myself in such a deep passionate way. My best friend and I made a pact - we were going to do all the things. Part of it was attending as many festivals and concerts as we wanted. Part of it was vacations and traveling. The final part was truly finding our community. Our people. That came in the form of themed nights. Goth nights. Drag nights. Emo nights. Blood raves.</p>
          <p>We became regulars. We made new friends. We made connections. It has been one of the most healing things I’ve experienced. I’m naturally introverted, and generally shy away from approaching people. But kandi has given me that little extra push to leave my comfort zone. Making people happy makes me happy. Becoming more social, more animated, less anxious - it was something I never thought I could experience. I’m becoming that version of me that I always saw in my head.</p>
          <p>Kandi was no longer about festivals or concerts. It had settled into part of my identity.</p>
        </div>
        <div className={`${styles['images']} col col-md-6`}>
          <div className={`grid`}>
            <div className={`${styles.gap} col-4`}>
              <img src="images/about/themed/goth_1.png" alt="themed night picture"/>
              <img src="images/about/themed/emo_1.png" alt="themed night picture"/>
              <img src="images/about/themed/drag_1.png" alt="themed night picture"/>
            </div>
            <div className={`${styles.gap} ${styles['theme-push-top']} col-4`}>
              <img src="images/about/themed/bloodRave.png" className={styles['grid-img-unset-ratio']} alt="themed night picture"/>
              <img src="images/about/themed/goth_2.png" className={styles['grid-img-unset-ratio']} alt="themed night picture"/>
            </div>
            <div className={`${styles.gap} ${styles['theme-push-top-small']} col-4`}>
              <img src="images/about/themed/drag_2.png" alt="themed night picture"/>
              <img src="images/about/themed/clown.png" alt="themed night picture"/>
              <img src="images/about/themed/emo_2.png" alt="themed night picture"/>
            </div>
          </div>
        </div>
      </div>
      <div className={`${styles['history-entry']} ${styles['inverse-entry']} grid`}>
        <div className={`${styles['entry']} col col-md-6`}>
          <h3>03 - Embracing Every Aspect</h3>
          <h2>Conventions & Cosplay</h2>
          <p>I was finding joy in welcoming all the pieces of myself. I had EDM. I had rock & metal. I had goth & emo. It was time for the nerd.</p>
          <p>I was in an experimental laptop program in 2001 with blue clamshell Apple laptops. I fell into Neopets fast and hard and ultimately began learning web design because of it. By high school I was taking a Java coding class and ended up majoring in Computer Science, minoring in Web Design and Mathematics. Ultimately becoming a software developer.</p>
          <p>With so much computer use enveloping my life, video games found their way in too. Halloween was slowly turning into cosplaying digital and physical characters instead of generic costumes. And once I found out about conventions I was ecstatic. I got to plan outfits. I got to make themed kandi and keychains for anyone that recognized who I was. I even tabled in cosplay at a small convention when I still did my Etsy shop.</p>
          <p>Another opportunity to embrace connection with a community of people I identified with.</p>
        </div>
        <div className={`${styles['images']} col col-md-6`}>
          <div className={`grid`}>
            <div className={`${styles.gap} ${styles['cosplay-push-top']} col-4`}>
              <img src="images/about/cosplay/vi.png" alt="cosplay picture"/>
              <img src="images/about/cosplay/cruella.png" className={`${styles['cosplay-image-small']} ${styles['cosplay-size-alignment']}`} alt="cosplay picture"/>
              <img src="images/about/cosplay/stayPuff.png" className={`${styles['cosplay-image-xsmall']} ${styles['cosplay-size-alignment']}`} alt="cosplay picture"/>
            </div>
            <div className={`${styles.gap} col-4`}>
              <img src="images/about/cosplay/crow.png" className={styles['grid-img-unset-ratio']} alt="cosplay picture"/>
              <img src="images/about/cosplay/raven.png" className={styles['grid-img-unset-ratio']} alt="cosplay picture"/>
            </div>
            <div className={`${styles.gap} ${styles['cosplay-push-top']} col-4`}>
              <img src="images/about/cosplay/thicc.png" className={styles['cosplay-image-small']} alt="cosplay picture"/>
              <img src="images/about/cosplay/vex.png" alt="cosplay picture"/>
              <img src="images/about/cosplay/rick.png" className={styles['cosplay-image-small']} alt="cosplay picture"/>
            </div>
          </div>
        </div>
      </div>
      <div className={styles['condensed-history-entry']}>
        <h2>Cruises</h2>
        <div className={styles['entry']}>
          <div className={styles['img-block']}>
            <img src="images/about/cruises/sunset.png" alt="cruise picture"/>
            <img src="images/about/cruises/kandiDinosaur.png" alt="cruise picture"/>
          </div>
          <p>With kandi hitting these big pieces of my personality, it began to become incorporated into more casual things. One of the biggest has been cruises. We were able to transform a time-honored tradition of duck hunting. Instead of bringing a bunch of rubber ducks, we turned to duck charms. We attached them to bracelets and went out every day hiding them across the ship.</p>
          <div className={styles['img-block']}>
            <img src="images/about/cruises/ship.png" alt="cruise picture"/>
            <img src="images/about/cruises/drink.png" alt="cruise picture"/>
          </div>
        </div>
      </div>
      <div className={`${styles['history-entry']} grid`}>
        <div className={`${styles['entry']} col col-md-6`}>
          <h3>05 - For the young & young at heart</h3>
          <h2>Theme Parks</h2>
          <p>One of the most prevalent activities I’ve been doing lately is going to Disney (and theme parks in general). My best friend and I were able to get our annual passes in June 2026. I’d go often as a child so it still holds a bit of that wonder when I go now. It wasn’t an immediate instinct to make purposely themed kandi for Disney. But, I brought some walking around kandi regardless. I ended up giving away three the first day and it just took off from there.</p>
          <p>I’ve got bracelets for princesses. Villains. Rides. Characters. The parks themselves. It’s become such an encompassing effort, I’d put it on par with festival preparation. It leaves so much room for creativity with the large pool of available content to work from. I’ve taken that excitement and expanded into the Universal parks as well. With kandi being uncommon here, people are surprised but so excited to see it’s themed to one of their favorite things - I look at their outfit, ears, backpack, etc. to find the one that fits them best.</p>
          <p>In doing all of this, I’ve hit another milestone - one of my absolute favorites. I’ve always given my kandi to adults. But now, I’ve begun making kandi for kids at the parks. The one I enjoy the most is the princess bracelets - each one themed to a specific princess. And when I see a little girl dressed to the nines with her sparkly hair and beautiful dress, I approach the parents. I ask if their daughter would like a bracelet. And without fail, every single time they say yes and I get to watch her little face light up as she puts it on. I don’t think I could ever stop making them. It makes my entire day.</p>
        </div>
        <div className={`${styles['images']} col col-md-6`}>
          <div className={`grid`}>
            <div className={`${styles.gap} col-8`}>
              <img className={styles['grid-img-unset-ratio']} src="images/about/theme-parks/darkmoor.png" alt="theme park picture"/>
              <div className={`grid`}>
                <div className={`col-6`}>
                  <img className={`${styles['park-image-small']} ${styles['parks-push-right']}`} src="images/about/theme-parks/mardi-gras.png" alt="theme park picture"/>
                  <img className={styles['grid-img-unset-ratio']} src="images/about/theme-parks/pride.png" alt="theme park picture"/>
                </div>
                <div className='col-6'>
                  <img className={styles['grid-img-unset-ratio']} src="images/about/theme-parks/tower-of-terror.png" alt="theme park picture"/>
                  <img className={styles['grid-img-1-1']} src="images/about/theme-parks/nintendo.png" alt="theme park picture"/>
                </div>
              </div>
              
            </div>
            <div className={`${styles.gap} col-4 ${styles['parks-push-top']}`}>
              <img src="images/about/theme-parks/frankenstein.png" alt="theme park picture"/>
              <img className={`${styles['park-image-small']}`} src="images/about/theme-parks/castle.png" alt="theme park picture"/>
              <img src="images/about/theme-parks/harry-potter.png" alt="theme park picture"/>
            </div>
          </div>
        </div>
      </div>
      <div className={`${styles['history-entry']} ${styles['inverse-entry']} grid`}>
        <div className={`${styles['entry']} col col-md-6`}>
          <h3>06 - A permanent part of my life</h3>
          <h2>Conventions & Cosplay</h2>
          <p>It’s been an all encompassing journey. So many pieces of my life have been touched by something that I essentially just stumbled into. Kandi is no longer tied to festivals, events, vacations, or experiences. It’s now tied to me. It’s rare that I leave the house without wearing some.</p>
          <p>I’ll set aside time just to make kandi, just to make sure I always have bracelets on hand. It has had such an unexpected impact on me, and I hope it leaves an impact on those I’ve made a connection with.</p>
        </div>
        <div className={`${styles['images']} col col-md-6`}>
          <div className={`grid`}>
            <div className={`${styles.gap} col-6`}>
              <img className={`${styles['parks-push-right']} ${styles['park-image-small']}`} src="images/about/life/theUsed.png" alt="life picture"/>
            </div>
            <div className={`${styles.gap} ${styles['flex-col']} col-6`}>
              <img src="images/about/life/parkingLot.png" alt="life picture"/>
            </div>
          </div>
          <div className={`grid`}>
            <div className={`${styles.gap} col-4`}>
              <img src="images/about/life/summer.png" alt="life picture"/>
              <img className={`${styles['parks-push-right']} ${styles['park-image-small']}`} src="images/about/life/iceCream.png" alt="life picture"/>
            </div>
            <div className={`${styles.gap} col-4`}>
              <img className={styles['grid-img-unset-ratio']} src="images/about/life/wings.png" alt="life picture"/>
            </div>
            <div className={`${styles.gap} col-4`}>
              <img className={styles['park-image-small']} src="images/about/life/selfie.png" alt="life picture"/>
              <img className={styles['cosplay-image-xsmall']} src="images/about/life/tattoos.png" alt="life picture"/>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.cta}>
        <h1>Want to say hello?</h1>
        <Link to={"/contact"} className='accent'><span>Send Me A Message</span></Link>
      </div>
    </Layout>
  );
};

export default About;
