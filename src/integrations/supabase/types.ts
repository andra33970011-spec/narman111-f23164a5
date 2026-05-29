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
      absensi_asn: {
        Row: {
          created_at: string
          device_info: string | null
          id: string
          lat: number | null
          lng: number | null
          opd_id: string
          tipe: Database["public"]["Enums"]["absensi_tipe"]
          user_id: string
          waktu: string
        }
        Insert: {
          created_at?: string
          device_info?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          opd_id: string
          tipe: Database["public"]["Enums"]["absensi_tipe"]
          user_id: string
          waktu?: string
        }
        Update: {
          created_at?: string
          device_info?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          opd_id?: string
          tipe?: Database["public"]["Enums"]["absensi_tipe"]
          user_id?: string
          waktu?: string
        }
        Relationships: [
          {
            foreignKeyName: "absensi_asn_opd_id_fkey"
            columns: ["opd_id"]
            isOneToOne: false
            referencedRelation: "opd"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "absensi_asn_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_setting: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      aset: {
        Row: {
          catatan: string | null
          created_at: string
          foto_url: string | null
          id: string
          kategori: string
          kode: string
          lat: number | null
          lng: number | null
          lokasi_terkini: string | null
          merk: string | null
          nama: string
          nomor_seri: string | null
          opd_id: string | null
          pemegang_user_id: string | null
          status: Database["public"]["Enums"]["aset_status"]
          updated_at: string
        }
        Insert: {
          catatan?: string | null
          created_at?: string
          foto_url?: string | null
          id?: string
          kategori?: string
          kode: string
          lat?: number | null
          lng?: number | null
          lokasi_terkini?: string | null
          merk?: string | null
          nama: string
          nomor_seri?: string | null
          opd_id?: string | null
          pemegang_user_id?: string | null
          status?: Database["public"]["Enums"]["aset_status"]
          updated_at?: string
        }
        Update: {
          catatan?: string | null
          created_at?: string
          foto_url?: string | null
          id?: string
          kategori?: string
          kode?: string
          lat?: number | null
          lng?: number | null
          lokasi_terkini?: string | null
          merk?: string | null
          nama?: string
          nomor_seri?: string | null
          opd_id?: string | null
          pemegang_user_id?: string | null
          status?: Database["public"]["Enums"]["aset_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aset_opd_id_fkey"
            columns: ["opd_id"]
            isOneToOne: false
            referencedRelation: "opd"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aset_pemegang_user_id_fkey"
            columns: ["pemegang_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      aset_riwayat: {
        Row: {
          aksi: string
          aset_id: string
          catatan: string | null
          created_at: string
          data: Json | null
          id: string
          lat: number | null
          lng: number | null
          lokasi_text: string | null
          oleh: string | null
        }
        Insert: {
          aksi: string
          aset_id: string
          catatan?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          lat?: number | null
          lng?: number | null
          lokasi_text?: string | null
          oleh?: string | null
        }
        Update: {
          aksi?: string
          aset_id?: string
          catatan?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          lat?: number | null
          lng?: number | null
          lokasi_text?: string | null
          oleh?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aset_riwayat_aset_id_fkey"
            columns: ["aset_id"]
            isOneToOne: false
            referencedRelation: "aset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aset_riwayat_oleh_fkey"
            columns: ["oleh"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          aksi: string
          created_at: string
          data_sebelum: Json | null
          data_sesudah: Json | null
          entitas: string
          entitas_id: string | null
          id: string
          ip_address: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          aksi: string
          created_at?: string
          data_sebelum?: Json | null
          data_sesudah?: Json | null
          entitas: string
          entitas_id?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          aksi?: string
          created_at?: string
          data_sebelum?: Json | null
          data_sesudah?: Json | null
          entitas?: string
          entitas_id?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      backup_snapshot: {
        Row: {
          created_at: string
          created_by: string | null
          data: Json
          id: string
          label: string
          size_bytes: number
          table_counts: Json
          tipe: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id?: string
          label: string
          size_bytes?: number
          table_counts?: Json
          tipe?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data?: Json
          id?: string
          label?: string
          size_bytes?: number
          table_counts?: Json
          tipe?: string
        }
        Relationships: []
      }
      berita: {
        Row: {
          created_at: string
          gambar_url: string | null
          id: string
          isi: string
          judul: string
          penulis_id: string | null
          published_at: string | null
          ringkasan: string | null
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          gambar_url?: string | null
          id?: string
          isi?: string
          judul: string
          penulis_id?: string | null
          published_at?: string | null
          ringkasan?: string | null
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          gambar_url?: string | null
          id?: string
          isi?: string
          judul?: string
          penulis_id?: string | null
          published_at?: string | null
          ringkasan?: string | null
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      data_requests: {
        Row: {
          alasan: string
          approval_note: string | null
          approved_at: string | null
          approver_id: string | null
          created_at: string
          expires_at: string | null
          id: string
          judul: string
          requester_opd_id: string | null
          requester_user_id: string
          resource_ref: string | null
          resource_type: string
          status: Database["public"]["Enums"]["data_request_status"]
          target_opd_id: string | null
          updated_at: string
        }
        Insert: {
          alasan: string
          approval_note?: string | null
          approved_at?: string | null
          approver_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          judul: string
          requester_opd_id?: string | null
          requester_user_id: string
          resource_ref?: string | null
          resource_type: string
          status?: Database["public"]["Enums"]["data_request_status"]
          target_opd_id?: string | null
          updated_at?: string
        }
        Update: {
          alasan?: string
          approval_note?: string | null
          approved_at?: string | null
          approver_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          judul?: string
          requester_opd_id?: string | null
          requester_user_id?: string
          resource_ref?: string | null
          resource_type?: string
          status?: Database["public"]["Enums"]["data_request_status"]
          target_opd_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_requests_requester_opd_id_fkey"
            columns: ["requester_opd_id"]
            isOneToOne: false
            referencedRelation: "opd"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_requests_target_opd_id_fkey"
            columns: ["target_opd_id"]
            isOneToOne: false
            referencedRelation: "opd"
            referencedColumns: ["id"]
          },
        ]
      }
      data_terpadu_item: {
        Row: {
          aktif: boolean
          created_at: string
          format: string | null
          id: string
          ikon: string | null
          kategori: string
          label: string
          nilai_num: number | null
          nilai_num2: number | null
          nilai_teks: string | null
          opd: string | null
          satuan: string | null
          trend: string | null
          ukuran: string | null
          updated_at: string
          url: string | null
          urutan: number
        }
        Insert: {
          aktif?: boolean
          created_at?: string
          format?: string | null
          id?: string
          ikon?: string | null
          kategori: string
          label: string
          nilai_num?: number | null
          nilai_num2?: number | null
          nilai_teks?: string | null
          opd?: string | null
          satuan?: string | null
          trend?: string | null
          ukuran?: string | null
          updated_at?: string
          url?: string | null
          urutan?: number
        }
        Update: {
          aktif?: boolean
          created_at?: string
          format?: string | null
          id?: string
          ikon?: string | null
          kategori?: string
          label?: string
          nilai_num?: number | null
          nilai_num2?: number | null
          nilai_teks?: string | null
          opd?: string | null
          satuan?: string | null
          trend?: string | null
          ukuran?: string | null
          updated_at?: string
          url?: string | null
          urutan?: number
        }
        Relationships: []
      }
      dataset_submission: {
        Row: {
          data: Json
          id: string
          oleh_user_id: string
          opd_id: string | null
          returned_note: string | null
          status: string
          submitted_at: string
          template_id: string
          updated_at: string
        }
        Insert: {
          data?: Json
          id?: string
          oleh_user_id: string
          opd_id?: string | null
          returned_note?: string | null
          status?: string
          submitted_at?: string
          template_id: string
          updated_at?: string
        }
        Update: {
          data?: Json
          id?: string
          oleh_user_id?: string
          opd_id?: string | null
          returned_note?: string | null
          status?: string
          submitted_at?: string
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dataset_submission_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "dataset_template"
            referencedColumns: ["id"]
          },
        ]
      }
      dataset_template: {
        Row: {
          aktif: boolean
          allow_multiple_submit: boolean
          created_at: string
          created_by: string | null
          deadline: string | null
          deskripsi: string | null
          excel_layout: Json
          id: string
          judul: string
          kode: string | null
          kolom: Json
          opd_pemilik_id: string | null
          target_opd_ids: string[] | null
          target_role: string
          target_scope: string
          updated_at: string
        }
        Insert: {
          aktif?: boolean
          allow_multiple_submit?: boolean
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          deskripsi?: string | null
          excel_layout?: Json
          id?: string
          judul: string
          kode?: string | null
          kolom?: Json
          opd_pemilik_id?: string | null
          target_opd_ids?: string[] | null
          target_role?: string
          target_scope?: string
          updated_at?: string
        }
        Update: {
          aktif?: boolean
          allow_multiple_submit?: boolean
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          deskripsi?: string | null
          excel_layout?: Json
          id?: string
          judul?: string
          kode?: string | null
          kolom?: Json
          opd_pemilik_id?: string | null
          target_opd_ids?: string[] | null
          target_role?: string
          target_scope?: string
          updated_at?: string
        }
        Relationships: []
      }
      desa: {
        Row: {
          aktif: boolean
          created_at: string
          id: string
          kecamatan: string | null
          nama: string
          updated_at: string
        }
        Insert: {
          aktif?: boolean
          created_at?: string
          id?: string
          kecamatan?: string | null
          nama: string
          updated_at?: string
        }
        Update: {
          aktif?: boolean
          created_at?: string
          id?: string
          kecamatan?: string | null
          nama?: string
          updated_at?: string
        }
        Relationships: []
      }
      document_access: {
        Row: {
          created_at: string
          expires_at: string | null
          granted_by: string
          id: string
          principal_id: string
          principal_type: string
          reason: string | null
          resource_id: string
          resource_type: string
          revoked_at: string | null
          revoked_by: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          granted_by: string
          id?: string
          principal_id: string
          principal_type: string
          reason?: string | null
          resource_id: string
          resource_type: string
          revoked_at?: string | null
          revoked_by?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          granted_by?: string
          id?: string
          principal_id?: string
          principal_type?: string
          reason?: string | null
          resource_id?: string
          resource_type?: string
          revoked_at?: string | null
          revoked_by?: string | null
        }
        Relationships: []
      }
      form_assignments: {
        Row: {
          assigned_at: string
          due_at: string | null
          form_id: string
          id: string
          opd_id: string | null
          status: Database["public"]["Enums"]["assignment_status"]
          user_id: string
        }
        Insert: {
          assigned_at?: string
          due_at?: string | null
          form_id: string
          id?: string
          opd_id?: string | null
          status?: Database["public"]["Enums"]["assignment_status"]
          user_id: string
        }
        Update: {
          assigned_at?: string
          due_at?: string | null
          form_id?: string
          id?: string
          opd_id?: string | null
          status?: Database["public"]["Enums"]["assignment_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_assignments_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_assignments_opd_id_fkey"
            columns: ["opd_id"]
            isOneToOne: false
            referencedRelation: "opd"
            referencedColumns: ["id"]
          },
        ]
      }
      form_fields: {
        Row: {
          created_at: string
          form_id: string
          help_text: string | null
          id: string
          kode: string
          label: string
          options: Json
          placeholder: string | null
          required: boolean
          tipe: Database["public"]["Enums"]["form_field_type"]
          urutan: number
          validation: Json
        }
        Insert: {
          created_at?: string
          form_id: string
          help_text?: string | null
          id?: string
          kode: string
          label: string
          options?: Json
          placeholder?: string | null
          required?: boolean
          tipe: Database["public"]["Enums"]["form_field_type"]
          urutan?: number
          validation?: Json
        }
        Update: {
          created_at?: string
          form_id?: string
          help_text?: string | null
          id?: string
          kode?: string
          label?: string
          options?: Json
          placeholder?: string | null
          required?: boolean
          tipe?: Database["public"]["Enums"]["form_field_type"]
          urutan?: number
          validation?: Json
        }
        Relationships: [
          {
            foreignKeyName: "form_fields_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submission_files: {
        Row: {
          cleanup_status: string
          created_at: string
          field_kode: string
          finalized_at: string | null
          id: string
          mime: string | null
          orphaned_at: string | null
          size_bytes: number | null
          storage_path: string
          submission_id: string
          upload_started_at: string | null
          uploaded_by: string
        }
        Insert: {
          cleanup_status?: string
          created_at?: string
          field_kode: string
          finalized_at?: string | null
          id?: string
          mime?: string | null
          orphaned_at?: string | null
          size_bytes?: number | null
          storage_path: string
          submission_id: string
          upload_started_at?: string | null
          uploaded_by: string
        }
        Update: {
          cleanup_status?: string
          created_at?: string
          field_kode?: string
          finalized_at?: string | null
          id?: string
          mime?: string | null
          orphaned_at?: string | null
          size_bytes?: number | null
          storage_path?: string
          submission_id?: string
          upload_started_at?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_submission_files_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submission_versions: {
        Row: {
          created_at: string
          created_by: string
          data: Json
          files: Json
          id: string
          submission_id: string
          version: number
        }
        Insert: {
          created_at?: string
          created_by: string
          data?: Json
          files?: Json
          id?: string
          submission_id: string
          version: number
        }
        Update: {
          created_at?: string
          created_by?: string
          data?: Json
          files?: Json
          id?: string
          submission_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "form_submission_versions_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "form_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          assignment_id: string | null
          created_at: string
          data: Json
          form_id: string
          id: string
          opd_id: string | null
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          schema_version_snapshot: Json
          status: string
          submitted_at: string | null
          updated_at: string
          user_id: string
          version_number: number
        }
        Insert: {
          assignment_id?: string | null
          created_at?: string
          data?: Json
          form_id: string
          id?: string
          opd_id?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          schema_version_snapshot?: Json
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id: string
          version_number?: number
        }
        Update: {
          assignment_id?: string | null
          created_at?: string
          data?: Json
          form_id?: string
          id?: string
          opd_id?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          schema_version_snapshot?: Json
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "form_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_targets: {
        Row: {
          created_at: string
          form_id: string
          id: string
          target_type: Database["public"]["Enums"]["form_target_type"]
          target_value: string
        }
        Insert: {
          created_at?: string
          form_id: string
          id?: string
          target_type: Database["public"]["Enums"]["form_target_type"]
          target_value: string
        }
        Update: {
          created_at?: string
          form_id?: string
          id?: string
          target_type?: Database["public"]["Enums"]["form_target_type"]
          target_value?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_targets_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      forms: {
        Row: {
          allow_multiple_submit: boolean
          archived_at: string | null
          created_at: string
          created_by: string
          deadline: string | null
          deskripsi: string | null
          id: string
          judul: string
          opd_pemilik_id: string | null
          published_at: string | null
          published_by: string | null
          schema_snapshot: Json
          status: Database["public"]["Enums"]["form_status"]
          updated_at: string
        }
        Insert: {
          allow_multiple_submit?: boolean
          archived_at?: string | null
          created_at?: string
          created_by: string
          deadline?: string | null
          deskripsi?: string | null
          id?: string
          judul: string
          opd_pemilik_id?: string | null
          published_at?: string | null
          published_by?: string | null
          schema_snapshot?: Json
          status?: Database["public"]["Enums"]["form_status"]
          updated_at?: string
        }
        Update: {
          allow_multiple_submit?: boolean
          archived_at?: string | null
          created_at?: string
          created_by?: string
          deadline?: string | null
          deskripsi?: string | null
          id?: string
          judul?: string
          opd_pemilik_id?: string | null
          published_at?: string | null
          published_by?: string | null
          schema_snapshot?: Json
          status?: Database["public"]["Enums"]["form_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forms_opd_pemilik_id_fkey"
            columns: ["opd_pemilik_id"]
            isOneToOne: false
            referencedRelation: "opd"
            referencedColumns: ["id"]
          },
        ]
      }
      job_queue: {
        Row: {
          attempts: number
          created_at: string
          created_by: string | null
          error: string | null
          finished_at: string | null
          id: string
          job_type: string
          max_attempts: number
          payload: Json
          result: Json | null
          scheduled_at: string
          started_at: string | null
          status: Database["public"]["Enums"]["job_status"]
        }
        Insert: {
          attempts?: number
          created_at?: string
          created_by?: string | null
          error?: string | null
          finished_at?: string | null
          id?: string
          job_type: string
          max_attempts?: number
          payload?: Json
          result?: Json | null
          scheduled_at?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["job_status"]
        }
        Update: {
          attempts?: number
          created_at?: string
          created_by?: string | null
          error?: string | null
          finished_at?: string | null
          id?: string
          job_type?: string
          max_attempts?: number
          payload?: Json
          result?: Json | null
          scheduled_at?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["job_status"]
        }
        Relationships: []
      }
      kantor_qr: {
        Row: {
          aktif: boolean
          created_at: string
          id: string
          label: string | null
          lat: number | null
          lng: number | null
          lokasi: string | null
          opd_id: string
          radius_m: number
          token: string
          updated_at: string
        }
        Insert: {
          aktif?: boolean
          created_at?: string
          id?: string
          label?: string | null
          lat?: number | null
          lng?: number | null
          lokasi?: string | null
          opd_id: string
          radius_m?: number
          token: string
          updated_at?: string
        }
        Update: {
          aktif?: boolean
          created_at?: string
          id?: string
          label?: string | null
          lat?: number | null
          lng?: number | null
          lokasi?: string | null
          opd_id?: string
          radius_m?: number
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kantor_qr_opd_id_fkey"
            columns: ["opd_id"]
            isOneToOne: true
            referencedRelation: "opd"
            referencedColumns: ["id"]
          },
        ]
      }
      kategori_layanan: {
        Row: {
          aktif: boolean
          created_at: string
          deskripsi: string | null
          id: string
          nama: string
          sla_hari: number
          slug: string
          updated_at: string
        }
        Insert: {
          aktif?: boolean
          created_at?: string
          deskripsi?: string | null
          id?: string
          nama: string
          sla_hari?: number
          slug: string
          updated_at?: string
        }
        Update: {
          aktif?: boolean
          created_at?: string
          deskripsi?: string | null
          id?: string
          nama?: string
          sla_hari?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      laporan_masyarakat: {
        Row: {
          created_at: string
          ditangani_oleh: string | null
          email: string
          id: string
          kategori: string
          lokasi: string | null
          nama: string
          nik: string | null
          no_hp: string | null
          opd_id: string | null
          status: string
          tindak_lanjut: string | null
          updated_at: string
          uraian: string
        }
        Insert: {
          created_at?: string
          ditangani_oleh?: string | null
          email: string
          id?: string
          kategori: string
          lokasi?: string | null
          nama: string
          nik?: string | null
          no_hp?: string | null
          opd_id?: string | null
          status?: string
          tindak_lanjut?: string | null
          updated_at?: string
          uraian: string
        }
        Update: {
          created_at?: string
          ditangani_oleh?: string | null
          email?: string
          id?: string
          kategori?: string
          lokasi?: string | null
          nama?: string
          nik?: string | null
          no_hp?: string | null
          opd_id?: string | null
          status?: string
          tindak_lanjut?: string | null
          updated_at?: string
          uraian?: string
        }
        Relationships: [
          {
            foreignKeyName: "laporan_masyarakat_opd_id_fkey"
            columns: ["opd_id"]
            isOneToOne: false
            referencedRelation: "opd"
            referencedColumns: ["id"]
          },
        ]
      }
      layanan_publik: {
        Row: {
          aktif: boolean
          alur: string | null
          created_at: string
          deskripsi: string | null
          id: string
          ikon: string | null
          judul: string
          opd_id: string | null
          persyaratan: string | null
          sla_hari: number
          slug: string
          updated_at: string
          urutan: number
        }
        Insert: {
          aktif?: boolean
          alur?: string | null
          created_at?: string
          deskripsi?: string | null
          id?: string
          ikon?: string | null
          judul: string
          opd_id?: string | null
          persyaratan?: string | null
          sla_hari?: number
          slug: string
          updated_at?: string
          urutan?: number
        }
        Update: {
          aktif?: boolean
          alur?: string | null
          created_at?: string
          deskripsi?: string | null
          id?: string
          ikon?: string | null
          judul?: string
          opd_id?: string | null
          persyaratan?: string | null
          sla_hari?: number
          slug?: string
          updated_at?: string
          urutan?: number
        }
        Relationships: [
          {
            foreignKeyName: "layanan_publik_opd_id_fkey"
            columns: ["opd_id"]
            isOneToOne: false
            referencedRelation: "opd"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          judul: string
          link: string | null
          meta: Json | null
          read_at: string | null
          tipe: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          judul: string
          link?: string | null
          meta?: Json | null
          read_at?: string | null
          tipe: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          judul?: string
          link?: string | null
          meta?: Json | null
          read_at?: string | null
          tipe?: string
          user_id?: string
        }
        Relationships: []
      }
      opd: {
        Row: {
          created_at: string
          id: string
          kategori: string[]
          nama: string
          singkatan: string
        }
        Insert: {
          created_at?: string
          id?: string
          kategori?: string[]
          nama: string
          singkatan: string
        }
        Update: {
          created_at?: string
          id?: string
          kategori?: string[]
          nama?: string
          singkatan?: string
        }
        Relationships: []
      }
      pejabat: {
        Row: {
          aktif: boolean
          created_at: string
          foto_url: string | null
          id: string
          is_pimpinan: boolean
          jabatan: string
          level: string | null
          nama: string
          updated_at: string
          urutan: number
          user_id: string | null
        }
        Insert: {
          aktif?: boolean
          created_at?: string
          foto_url?: string | null
          id?: string
          is_pimpinan?: boolean
          jabatan: string
          level?: string | null
          nama: string
          updated_at?: string
          urutan?: number
          user_id?: string | null
        }
        Update: {
          aktif?: boolean
          created_at?: string
          foto_url?: string | null
          id?: string
          is_pimpinan?: boolean
          jabatan?: string
          level?: string | null
          nama?: string
          updated_at?: string
          urutan?: number
          user_id?: string | null
        }
        Relationships: []
      }
      permissions: {
        Row: {
          code: string
          created_at: string
          description: string | null
          kategori: string
          label: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          kategori?: string
          label: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          kategori?: string
          label?: string
        }
        Relationships: []
      }
      permohonan: {
        Row: {
          atas_nama_hp: string | null
          atas_nama_nama: string | null
          atas_nama_nik: string | null
          deskripsi: string | null
          id: string
          judul: string
          kategori: string
          kode: string
          opd_id: string
          pemohon_id: string
          petugas_id: string | null
          prioritas: string
          ringkasan: string | null
          status: Database["public"]["Enums"]["status_permohonan"]
          tanggal_masuk: string
          tenggat: string | null
          untuk_orang_lain: boolean
          updated_at: string
          wakil_ambil_nama: string | null
          wakil_ambil_nik: string | null
        }
        Insert: {
          atas_nama_hp?: string | null
          atas_nama_nama?: string | null
          atas_nama_nik?: string | null
          deskripsi?: string | null
          id?: string
          judul: string
          kategori: string
          kode: string
          opd_id: string
          pemohon_id: string
          petugas_id?: string | null
          prioritas?: string
          ringkasan?: string | null
          status?: Database["public"]["Enums"]["status_permohonan"]
          tanggal_masuk?: string
          tenggat?: string | null
          untuk_orang_lain?: boolean
          updated_at?: string
          wakil_ambil_nama?: string | null
          wakil_ambil_nik?: string | null
        }
        Update: {
          atas_nama_hp?: string | null
          atas_nama_nama?: string | null
          atas_nama_nik?: string | null
          deskripsi?: string | null
          id?: string
          judul?: string
          kategori?: string
          kode?: string
          opd_id?: string
          pemohon_id?: string
          petugas_id?: string | null
          prioritas?: string
          ringkasan?: string | null
          status?: Database["public"]["Enums"]["status_permohonan"]
          tanggal_masuk?: string
          tenggat?: string | null
          untuk_orang_lain?: boolean
          updated_at?: string
          wakil_ambil_nama?: string | null
          wakil_ambil_nik?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "permohonan_opd_id_fkey"
            columns: ["opd_id"]
            isOneToOne: false
            referencedRelation: "opd"
            referencedColumns: ["id"]
          },
        ]
      }
      permohonan_rating: {
        Row: {
          created_at: string
          id: string
          komentar: string | null
          permohonan_id: string
          skor: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          komentar?: string | null
          permohonan_id: string
          skor: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          komentar?: string | null
          permohonan_id?: string
          skor?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "permohonan_rating_permohonan_id_fkey"
            columns: ["permohonan_id"]
            isOneToOne: false
            referencedRelation: "permohonan"
            referencedColumns: ["id"]
          },
        ]
      }
      permohonan_riwayat: {
        Row: {
          aksi: string
          catatan: string | null
          created_at: string
          id: string
          oleh: string | null
          permohonan_id: string
        }
        Insert: {
          aksi: string
          catatan?: string | null
          created_at?: string
          id?: string
          oleh?: string | null
          permohonan_id: string
        }
        Update: {
          aksi?: string
          catatan?: string | null
          created_at?: string
          id?: string
          oleh?: string | null
          permohonan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "permohonan_riwayat_permohonan_id_fkey"
            columns: ["permohonan_id"]
            isOneToOne: false
            referencedRelation: "permohonan"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          asn_type: Database["public"]["Enums"]["asn_type"] | null
          created_at: string
          desa: string | null
          id: string
          jabatan: string | null
          nama_lengkap: string
          nik: string | null
          nip: string | null
          no_hp: string | null
          opd_id: string | null
          status: string
          system_position: Database["public"]["Enums"]["system_position"] | null
          unit_kerja_id: string | null
          updated_at: string
          username: string | null
          verification_status:
            | Database["public"]["Enums"]["verification_status_enum"]
            | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          asn_type?: Database["public"]["Enums"]["asn_type"] | null
          created_at?: string
          desa?: string | null
          id: string
          jabatan?: string | null
          nama_lengkap?: string
          nik?: string | null
          nip?: string | null
          no_hp?: string | null
          opd_id?: string | null
          status?: string
          system_position?:
            | Database["public"]["Enums"]["system_position"]
            | null
          unit_kerja_id?: string | null
          updated_at?: string
          username?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status_enum"]
            | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          asn_type?: Database["public"]["Enums"]["asn_type"] | null
          created_at?: string
          desa?: string | null
          id?: string
          jabatan?: string | null
          nama_lengkap?: string
          nik?: string | null
          nip?: string | null
          no_hp?: string | null
          opd_id?: string | null
          status?: string
          system_position?:
            | Database["public"]["Enums"]["system_position"]
            | null
          unit_kerja_id?: string | null
          updated_at?: string
          username?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status_enum"]
            | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_opd_id_fkey"
            columns: ["opd_id"]
            isOneToOne: false
            referencedRelation: "opd"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_unit_kerja_id_fkey"
            columns: ["unit_kerja_id"]
            isOneToOne: false
            referencedRelation: "unit_kerja"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscription: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      rate_limit: {
        Row: {
          bucket: string
          count: number
          id: string
          identifier: string
          window_start: string
        }
        Insert: {
          bucket: string
          count?: number
          id?: string
          identifier: string
          window_start?: string
        }
        Update: {
          bucket?: string
          count?: number
          id?: string
          identifier?: string
          window_start?: string
        }
        Relationships: []
      }
      rate_limit_hits: {
        Row: {
          blocked: boolean
          count: number
          id: number
          last_hit_at: string
          scope: string
          subject: string
          window_start: string
        }
        Insert: {
          blocked?: boolean
          count?: number
          id?: number
          last_hit_at?: string
          scope: string
          subject: string
          window_start: string
        }
        Update: {
          blocked?: boolean
          count?: number
          id?: number
          last_hit_at?: string
          scope?: string
          subject?: string
          window_start?: string
        }
        Relationships: []
      }
      rbac_audit: {
        Row: {
          aksi: string
          created_at: string
          data_sebelum: Json | null
          data_sesudah: Json | null
          entitas: string
          id: string
          target_user_id: string | null
          user_id: string | null
        }
        Insert: {
          aksi: string
          created_at?: string
          data_sebelum?: Json | null
          data_sesudah?: Json | null
          entitas: string
          id?: string
          target_user_id?: string | null
          user_id?: string | null
        }
        Update: {
          aksi?: string
          created_at?: string
          data_sebelum?: Json | null
          data_sesudah?: Json | null
          entitas?: string
          id?: string
          target_user_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission_code: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          permission_code: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          id?: string
          permission_code?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_code_fkey"
            columns: ["permission_code"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["code"]
          },
        ]
      }
      submission_answers: {
        Row: {
          created_at: string
          field_id: string
          id: string
          submission_id: string
          updated_at: string
          value_json: Json | null
          value_num: number | null
          value_text: string | null
        }
        Insert: {
          created_at?: string
          field_id: string
          id?: string
          submission_id: string
          updated_at?: string
          value_json?: Json | null
          value_num?: number | null
          value_text?: string | null
        }
        Update: {
          created_at?: string
          field_id?: string
          id?: string
          submission_id?: string
          updated_at?: string
          value_json?: Json | null
          value_num?: number | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submission_answers_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "form_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submission_answers_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_files: {
        Row: {
          created_at: string
          field_id: string | null
          id: string
          mime_type: string | null
          nama_file: string
          size_bytes: number | null
          storage_path: string
          submission_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          field_id?: string | null
          id?: string
          mime_type?: string | null
          nama_file: string
          size_bytes?: number | null
          storage_path: string
          submission_id: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          field_id?: string | null
          id?: string
          mime_type?: string | null
          nama_file?: string
          size_bytes?: number | null
          storage_path?: string
          submission_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_files_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "form_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submission_files_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          assignment_id: string
          created_at: string
          form_id: string
          id: string
          opd_id: string | null
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["submission_status"]
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assignment_id: string
          created_at?: string
          form_id: string
          id?: string
          opd_id?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assignment_id?: string
          created_at?: string
          form_id?: string
          id?: string
          opd_id?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "form_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_opd_id_fkey"
            columns: ["opd_id"]
            isOneToOne: false
            referencedRelation: "opd"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_kerja: {
        Row: {
          aktif: boolean
          created_at: string
          id: string
          kode: string | null
          nama: string
          opd_id: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          aktif?: boolean
          created_at?: string
          id?: string
          kode?: string | null
          nama: string
          opd_id: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          aktif?: boolean
          created_at?: string
          id?: string
          kode?: string | null
          nama?: string
          opd_id?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "unit_kerja_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "unit_kerja"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          created_at: string
          expires_at: string | null
          granted: boolean
          granted_by: string | null
          id: string
          permission_code: string
          reason: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          granted?: boolean
          granted_by?: string | null
          id?: string
          permission_code: string
          reason?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          granted?: boolean
          granted_by?: string | null
          id?: string
          permission_code?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_permission_code_fkey"
            columns: ["permission_code"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["code"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verification_logs: {
        Row: {
          action: string
          actor_id: string
          catatan: string | null
          created_at: string
          id: string
          meta: Json | null
          target_id: string
          target_type: string
        }
        Insert: {
          action: string
          actor_id: string
          catatan?: string | null
          created_at?: string
          id?: string
          meta?: Json | null
          target_id: string
          target_type: string
        }
        Update: {
          action?: string
          actor_id?: string
          catatan?: string | null
          created_at?: string
          id?: string
          meta?: Json | null
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      verification_token: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          token: string
          used_at: string | null
          used_by: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          token: string
          used_at?: string | null
          used_by?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          token?: string
          used_at?: string | null
          used_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _lovable_exec_sql: { Args: { sql: string }; Returns: undefined }
      count_permohonan_bulan_ini: { Args: never; Returns: number }
      get_effective_permissions: {
        Args: { _user_id: string }
        Returns: {
          permission_code: string
        }[]
      }
      get_user_asn_type: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["asn_type"]
      }
      get_user_desa: { Args: { _user_id: string }; Returns: string }
      get_user_opd: { Args: { _user_id: string }; Returns: string }
      get_user_position: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["system_position"]
      }
      has_permission: {
        Args: { _code: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_pemohon_of_opd: {
        Args: { _profile_id: string; _user_id: string }
        Returns: boolean
      }
      is_pimpinan: { Args: { _user_id: string }; Returns: boolean }
      is_warga_in_admin_desa: {
        Args: { _pemohon_id: string; _user_id: string }
        Returns: boolean
      }
      opd_kinerja_agg: {
        Args: never
        Returns: {
          jumlah_selesai: number
          opd_id: string
          selesai_dengan_sla: number
          status: string
          tepat_waktu: number
          total: number
          total_hari_selesai: number
        }[]
      }
      opd_rating_agg: {
        Args: never
        Returns: {
          jumlah_rating: number
          opd_id: string
          total_rating: number
        }[]
      }
      rate_limit_increment: {
        Args: { _scope: string; _subject: string; _window_start: string }
        Returns: number
      }
      rating_list_admin: {
        Args: never
        Returns: {
          created_at: string
          komentar: string
          opd_id: string
          opd_nama: string
          opd_singkatan: string
          pemohon_nama: string
          permohonan_id: string
          permohonan_judul: string
          permohonan_kode: string
          rating_id: string
          skor: number
          user_id: string
        }[]
      }
      rating_public_stats: {
        Args: never
        Returns: {
          avg_skor: number
          total: number
        }[]
      }
      riwayat_dengan_petugas: {
        Args: { _permohonan_id: string }
        Returns: {
          aksi: string
          catatan: string
          created_at: string
          email_petugas: string
          id: string
          nama_petugas: string
          oleh: string
        }[]
      }
      user_in_desa: {
        Args: { _desa: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      absensi_tipe: "masuk" | "pulang"
      app_role:
        | "warga"
        | "admin_opd"
        | "super_admin"
        | "admin_desa"
        | "asn"
        | "admin_pemda"
      aset_status: "aktif" | "rusak" | "dihapuskan"
      asn_type: "pns" | "pppk_penuh_waktu" | "pppk_paruh_waktu" | "honorer"
      assignment_status:
        | "assigned"
        | "in_progress"
        | "submitted"
        | "approved"
        | "rejected"
        | "revision_required"
        | "overdue"
      data_request_status:
        | "pending"
        | "approved"
        | "rejected"
        | "revoked"
        | "expired"
      form_field_type:
        | "short_text"
        | "long_text"
        | "dropdown"
        | "checkbox"
        | "radio"
        | "date"
        | "number"
        | "file_upload"
        | "multi_file_upload"
      form_status: "draft" | "published" | "archived"
      form_target_type:
        | "opd"
        | "asn_type"
        | "position"
        | "unit_kerja"
        | "role"
        | "individu"
      job_status: "pending" | "running" | "success" | "failed" | "dead"
      status_permohonan: "baru" | "diproses" | "selesai" | "ditolak"
      submission_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "approved"
        | "rejected"
        | "revision_required"
      system_position:
        | "kepala_opd"
        | "sekretaris"
        | "kepala_bidang"
        | "kepala_sekolah"
        | "operator"
        | "verifikator"
        | "staff"
        | "guru"
        | "tenaga_teknis"
        | "lainnya"
      verification_status_enum:
        | "pending"
        | "approved"
        | "rejected"
        | "revision_required"
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
      absensi_tipe: ["masuk", "pulang"],
      app_role: [
        "warga",
        "admin_opd",
        "super_admin",
        "admin_desa",
        "asn",
        "admin_pemda",
      ],
      aset_status: ["aktif", "rusak", "dihapuskan"],
      asn_type: ["pns", "pppk_penuh_waktu", "pppk_paruh_waktu", "honorer"],
      assignment_status: [
        "assigned",
        "in_progress",
        "submitted",
        "approved",
        "rejected",
        "revision_required",
        "overdue",
      ],
      data_request_status: [
        "pending",
        "approved",
        "rejected",
        "revoked",
        "expired",
      ],
      form_field_type: [
        "short_text",
        "long_text",
        "dropdown",
        "checkbox",
        "radio",
        "date",
        "number",
        "file_upload",
        "multi_file_upload",
      ],
      form_status: ["draft", "published", "archived"],
      form_target_type: [
        "opd",
        "asn_type",
        "position",
        "unit_kerja",
        "role",
        "individu",
      ],
      job_status: ["pending", "running", "success", "failed", "dead"],
      status_permohonan: ["baru", "diproses", "selesai", "ditolak"],
      submission_status: [
        "draft",
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "revision_required",
      ],
      system_position: [
        "kepala_opd",
        "sekretaris",
        "kepala_bidang",
        "kepala_sekolah",
        "operator",
        "verifikator",
        "staff",
        "guru",
        "tenaga_teknis",
        "lainnya",
      ],
      verification_status_enum: [
        "pending",
        "approved",
        "rejected",
        "revision_required",
      ],
    },
  },
} as const
