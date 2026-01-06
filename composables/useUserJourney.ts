import { driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

export const useUserJourney = () => {
  const journeys: Record<string, DriveStep[]> = {
    login: [
      {
        element: '#role-selector',
        popover: {
          title: 'Choisissez votre rôle',
          description: 'Sélectionnez le type de compte qui vous correspond : Incubé, Formateur ou Admin.',
          side: "bottom",
          align: 'start'
        }
      },
      {
        element: '#login-email',
        popover: {
          title: 'Votre Identifiant',
          description: 'Entrez votre adresse email ici.',
          side: "right",
          align: 'start'
        }
      },
      {
        element: '#login-password',
        popover: {
          title: 'Mot de passe',
          description: 'Saisissez votre mot de passe sécurisé.',
          side: "right",
          align: 'start'
        }
      },
      {
        element: '#forgot-password-btn',
        popover: {
          title: 'Oubli ?',
          description: 'En cas d\'oubli, cliquez ici pour réinitialiser votre mot de passe.',
          side: "bottom",
          align: 'center'
        }
      },
      {
        element: '#login-submit-btn',
        popover: {
          title: 'Connexion',
          description: 'Cliquez ici pour accéder à votre espace.',
          side: "top",
          align: 'center'
        }
      },
      {
        element: '#register-link',
        popover: {
          title: 'Pas encore inscrit ?',
          description: 'Si vous êtes un nouvel incubé, créez votre compte ici.',
          side: "top",
          align: 'center'
        }
      }
    ],
    register: [
      {
        element: '#register-firstname',
        popover: {
          title: 'Prénom',
          description: 'Veuillez saisir votre prénom.',
          side: "top",
          align: 'start'
        }
      },
      {
        element: '#register-lastname',
        popover: {
          title: 'Nom',
          description: 'Veuillez saisir votre nom de famille.',
          side: "top",
          align: 'start'
        }
      },
      {
        element: '#register-email',
        popover: {
          title: 'Adresse Email',
          description: 'Une adresse email valide est requise pour la communication.',
          side: "right",
          align: 'start'
        }
      },
      {
        element: '#register-phone',
        popover: {
          title: 'Numéro de téléphone',
          description: 'Format recommandé : +22901XXXXXXXX',
          side: "right",
          align: 'start'
        }
      },
      {
        element: '#register-password',
        popover: {
          title: 'Mot de passe sécurisé',
          description: 'Doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial.',
          side: "left",
          align: 'start'
        }
      },
      {
        element: '#register-submit-btn',
        popover: {
          title: 'Finaliser l\'inscription',
          description: 'Cliquez pour créer votre compte et commencer l\'aventure.',
          side: "top",
          align: 'center'
        }
      }
    ],
    sidebar: [
      {
        element: '#app-sidebar',
        popover: {
          title: 'Menu de navigation',
          description: 'Accédez à toutes les fonctionnalités de l\'application depuis ce menu latéral.',
          side: "right",
          align: 'start'
        }
      },
      {
        element: '#sidebar-toggle',
        popover: {
          title: 'Réduire / Agrandir',
          description: 'Cliquez ici pour gagner de l\'espace en réduisant le menu.',
          side: "right",
          align: 'center'
        }
      },
      {
        element: '#sidebar-nav',
        popover: {
          title: 'Fonctionnalités',
          description: 'Naviguez entre vos différentes sections : Tableau de bord, Présences, Permissions, etc.',
          side: "right",
          align: 'center'
        }
      },
      {
        element: '#sidebar-help-section',
        popover: {
          title: 'Besoin d\'aide ?',
          description: 'Contactez le support ou consultez les guides depuis cette section.',
          side: "right",
          align: 'center'
        }
      }
    ]
  };


  const startJourney = (journeyKey: string, context: Record<string, any> = {}) => {
    let steps = journeys[journeyKey];

    if (!steps) {
      console.warn(`No journey found for key: ${journeyKey}`);
      return;
    }

    // Filtrer les étapes en fonction du contexte
    if (journeyKey === 'login') {
      if (context.role !== 'incube') {
        steps = steps.filter(step => step.element !== '#register-link');
      }
    }

    const driverObj = driver({
      showProgress: true,
      steps: steps,
      nextBtnText: 'Suivant',
      prevBtnText: 'Précédent',
      doneBtnText: 'Terminé',
      allowClose: true,
    });

    driverObj.drive();
  };

  return {
    startJourney,
  };
};
