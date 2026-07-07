export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      absences: {
        Row: {
          classe_id: string | null
          classe_nom: string
          created_at: string
          date_absence: string
          etudiant_id: string
          id: string
          justifiee: boolean
          matiere: string
          updated_at: string
        }
        Insert: {
          classe_id?: string | null
          classe_nom?: string
          created_at?: string
          date_absence: string
          etudiant_id: string
          id?: string
          justifiee?: boolean
          matiere?: string
          updated_at?: string
        }
        Update: {
          classe_id?: string | null
          classe_nom?: string
          created_at?: string
          date_absence?: string
          etudiant_id?: string
          id?: string
          justifiee?: boolean
          matiere?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "absences_classe_id_fkey"
            columns: ["classe_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "absences_etudiant_id_fkey"
            columns: ["etudiant_id"]
            isOneToOne: false
            referencedRelation: "etudiants"
            referencedColumns: ["id"]
          },
        ]
      }
      alertes: {
        Row: {
          classe_nom: string
          created_at: string
          date_alerte: string
          etudiant_id: string
          id: string
          indicator_color: string
          legacy_id: string | null
          motif: string
          niveau: Database["public"]["Enums"]["niveau_alerte"]
          statut: Database["public"]["Enums"]["statut_alerte"]
          updated_at: string
        }
        Insert: {
          classe_nom?: string
          created_at?: string
          date_alerte?: string
          etudiant_id: string
          id?: string
          indicator_color?: string
          legacy_id?: string | null
          motif?: string
          niveau?: Database["public"]["Enums"]["niveau_alerte"]
          statut?: Database["public"]["Enums"]["statut_alerte"]
          updated_at?: string
        }
        Update: {
          classe_nom?: string
          created_at?: string
          date_alerte?: string
          etudiant_id?: string
          id?: string
          indicator_color?: string
          legacy_id?: string | null
          motif?: string
          niveau?: Database["public"]["Enums"]["niveau_alerte"]
          statut?: Database["public"]["Enums"]["statut_alerte"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alertes_etudiant_id_fkey"
            columns: ["etudiant_id"]
            isOneToOne: false
            referencedRelation: "etudiants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          cible: string
          created_at: string
          details: string
          id: string
          legacy_id: string | null
          utilisateur: string
        }
        Insert: {
          action: string
          cible?: string
          created_at?: string
          details?: string
          id?: string
          legacy_id?: string | null
          utilisateur?: string
        }
        Update: {
          action?: string
          cible?: string
          created_at?: string
          details?: string
          id?: string
          legacy_id?: string | null
          utilisateur?: string
        }
        Relationships: []
      }
      candidatures: {
        Row: {
          adresse: string
          completude: number
          created_at: string
          date_naissance: string
          date_soumission: string
          email: string
          filiere_id: string | null
          filiere_nom: string
          historique: Json
          id: string
          legacy_id: string
          niveau: string
          nom: string
          pieces: Json
          prenom: string
          statut: Database["public"]["Enums"]["statut_dossier"]
          synthese_ia: string
          telephone: string
          updated_at: string
        }
        Insert: {
          adresse?: string
          completude?: number
          created_at?: string
          date_naissance?: string
          date_soumission?: string
          email: string
          filiere_id?: string | null
          filiere_nom?: string
          historique?: Json
          id?: string
          legacy_id: string
          niveau?: string
          nom: string
          pieces?: Json
          prenom: string
          statut?: Database["public"]["Enums"]["statut_dossier"]
          synthese_ia?: string
          telephone?: string
          updated_at?: string
        }
        Update: {
          adresse?: string
          completude?: number
          created_at?: string
          date_naissance?: string
          date_soumission?: string
          email?: string
          filiere_id?: string | null
          filiere_nom?: string
          historique?: Json
          id?: string
          legacy_id?: string
          niveau?: string
          nom?: string
          pieces?: Json
          prenom?: string
          statut?: Database["public"]["Enums"]["statut_dossier"]
          synthese_ia?: string
          telephone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidatures_filiere_id_fkey"
            columns: ["filiere_id"]
            isOneToOne: false
            referencedRelation: "filieres"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          created_at: string
          effectif: number
          filiere_id: string
          id: string
          legacy_id: string | null
          niveau: string
          nom: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          effectif?: number
          filiere_id: string
          id?: string
          legacy_id?: string | null
          niveau: string
          nom: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          effectif?: number
          filiere_id?: string
          id?: string
          legacy_id?: string | null
          niveau?: string
          nom?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_filiere_id_fkey"
            columns: ["filiere_id"]
            isOneToOne: false
            referencedRelation: "filieres"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_charts: {
        Row: {
          created_at: string
          data: Json
          id: string
          key: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          key: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          key?: string
          updated_at?: string
        }
        Relationships: []
      }
      enseignant_classes: {
        Row: {
          classe_id: string
          enseignant_id: string
        }
        Insert: {
          classe_id: string
          enseignant_id: string
        }
        Update: {
          classe_id?: string
          enseignant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enseignant_classes_classe_id_fkey"
            columns: ["classe_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enseignant_classes_enseignant_id_fkey"
            columns: ["enseignant_id"]
            isOneToOne: false
            referencedRelation: "enseignants"
            referencedColumns: ["id"]
          },
        ]
      }
      enseignant_matieres: {
        Row: {
          enseignant_id: string
          matiere_id: string
        }
        Insert: {
          enseignant_id: string
          matiere_id: string
        }
        Update: {
          enseignant_id?: string
          matiere_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enseignant_matieres_enseignant_id_fkey"
            columns: ["enseignant_id"]
            isOneToOne: false
            referencedRelation: "enseignants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enseignant_matieres_matiere_id_fkey"
            columns: ["matiere_id"]
            isOneToOne: false
            referencedRelation: "matieres"
            referencedColumns: ["id"]
          },
        ]
      }
      enseignants: {
        Row: {
          created_at: string
          email: string
          id: string
          legacy_id: string | null
          nom: string
          prenom: string
          profile_id: string | null
          statut: Database["public"]["Enums"]["statut_enseignant"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          legacy_id?: string | null
          nom: string
          prenom: string
          profile_id?: string | null
          statut?: Database["public"]["Enums"]["statut_enseignant"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          legacy_id?: string | null
          nom?: string
          prenom?: string
          profile_id?: string | null
          statut?: Database["public"]["Enums"]["statut_enseignant"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "enseignants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      etudiants: {
        Row: {
          assiduite: number
          classe_id: string | null
          created_at: string
          email: string
          id: string
          legacy_id: string | null
          matricule: string
          moyenne: number
          nom: string
          prenom: string
          profile_id: string | null
          statut: Database["public"]["Enums"]["statut_etudiant"]
          updated_at: string
        }
        Insert: {
          assiduite?: number
          classe_id?: string | null
          created_at?: string
          email: string
          id?: string
          legacy_id?: string | null
          matricule: string
          moyenne?: number
          nom: string
          prenom: string
          profile_id?: string | null
          statut?: Database["public"]["Enums"]["statut_etudiant"]
          updated_at?: string
        }
        Update: {
          assiduite?: number
          classe_id?: string | null
          created_at?: string
          email?: string
          id?: string
          legacy_id?: string | null
          matricule?: string
          moyenne?: number
          nom?: string
          prenom?: string
          profile_id?: string | null
          statut?: Database["public"]["Enums"]["statut_etudiant"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "etudiants_classe_id_fkey"
            columns: ["classe_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "etudiants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      filieres: {
        Row: {
          code: string
          created_at: string
          description: string
          id: string
          legacy_id: string | null
          nom: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string
          id?: string
          legacy_id?: string | null
          nom: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string
          id?: string
          legacy_id?: string | null
          nom?: string
          updated_at?: string
        }
        Relationships: []
      }
      matieres: {
        Row: {
          coefficient: number
          created_at: string
          filiere_id: string
          id: string
          legacy_id: string | null
          nom: string
          updated_at: string
        }
        Insert: {
          coefficient?: number
          created_at?: string
          filiere_id: string
          id?: string
          legacy_id?: string | null
          nom: string
          updated_at?: string
        }
        Update: {
          coefficient?: number
          created_at?: string
          filiere_id?: string
          id?: string
          legacy_id?: string | null
          nom?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matieres_filiere_id_fkey"
            columns: ["filiere_id"]
            isOneToOne: false
            referencedRelation: "filieres"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          classe_id: string | null
          classe_nom: string
          coefficient: number
          created_at: string
          etudiant_id: string
          id: string
          matiere_id: string | null
          matiere_nom: string
          note: number | null
          periode: string
          sur: number
          updated_at: string
        }
        Insert: {
          classe_id?: string | null
          classe_nom?: string
          coefficient?: number
          created_at?: string
          etudiant_id: string
          id?: string
          matiere_id?: string | null
          matiere_nom?: string
          note?: number | null
          periode?: string
          sur?: number
          updated_at?: string
        }
        Update: {
          classe_id?: string | null
          classe_nom?: string
          coefficient?: number
          created_at?: string
          etudiant_id?: string
          id?: string
          matiere_id?: string | null
          matiere_nom?: string
          note?: number | null
          periode?: string
          sur?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_classe_id_fkey"
            columns: ["classe_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_etudiant_id_fkey"
            columns: ["etudiant_id"]
            isOneToOne: false
            referencedRelation: "etudiants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_matiere_id_fkey"
            columns: ["matiere_id"]
            isOneToOne: false
            referencedRelation: "matieres"
            referencedColumns: ["id"]
          },
        ]
      }
      parametres: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          derniere_connexion: string | null
          email: string
          id: string
          legacy_id: string | null
          nom: string
          prenom: string
          role: Database["public"]["Enums"]["app_role"]
          statut: Database["public"]["Enums"]["statut_compte"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          derniere_connexion?: string | null
          email: string
          id: string
          legacy_id?: string | null
          nom: string
          prenom: string
          role?: Database["public"]["Enums"]["app_role"]
          statut?: Database["public"]["Enums"]["statut_compte"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          derniere_connexion?: string | null
          email?: string
          id?: string
          legacy_id?: string | null
          nom?: string
          prenom?: string
          role?: Database["public"]["Enums"]["app_role"]
          statut?: Database["public"]["Enums"]["statut_compte"]
          updated_at?: string
        }
        Relationships: []
      }
      rapports: {
        Row: {
          created_at: string
          date_generation: string
          genere_par: string
          id: string
          legacy_id: string | null
          periode: string
          taille: string
          titre: string
          type: Database["public"]["Enums"]["type_rapport"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_generation?: string
          genere_par?: string
          id?: string
          legacy_id?: string | null
          periode?: string
          taille?: string
          titre: string
          type?: Database["public"]["Enums"]["type_rapport"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_generation?: string
          genere_par?: string
          id?: string
          legacy_id?: string | null
          periode?: string
          taille?: string
          titre?: string
          type?: Database["public"]["Enums"]["type_rapport"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      current_enseignant_id: { Args: never; Returns: string }
      current_etudiant_id: { Args: never; Returns: string }
      current_profile_email: { Args: never; Returns: string }
      enseignant_has_classe: { Args: { p_classe_id: string }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      is_responsable_or_admin: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      log_audit: {
        Args: { p_action: string; p_cible: string; p_details: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "candidat" | "etudiant" | "enseignant" | "responsable" | "admin"
      niveau_alerte: "Élevé" | "Moyen" | "Faible"
      statut_alerte: "Nouvelle" | "Prise en charge" | "Clôturée"
      statut_compte: "Actif" | "Désactivé"
      statut_dossier: "En attente" | "Validé" | "Incomplet" | "Rejeté"
      statut_enseignant: "Actif" | "Congé"
      statut_etudiant: "Actif" | "Suspendu"
      type_rapport: "Mensuel" | "Hebdomadaire" | "Trimestriel" | "Ponctuel"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["candidat", "etudiant", "enseignant", "responsable", "admin"],
      niveau_alerte: ["Élevé", "Moyen", "Faible"],
      statut_alerte: ["Nouvelle", "Prise en charge", "Clôturée"],
      statut_compte: ["Actif", "Désactivé"],
      statut_dossier: ["En attente", "Validé", "Incomplet", "Rejeté"],
      statut_enseignant: ["Actif", "Congé"],
      statut_etudiant: ["Actif", "Suspendu"],
      type_rapport: ["Mensuel", "Hebdomadaire", "Trimestriel", "Ponctuel"],
    },
  },
} as const
