# frozen_string_literal: true

module Api
  module V1
    # rubocop:disable Metrics/ClassLength
    class ChroniclesController < Api::V1::BaseController
      before_action :authenticate_player
      skip_before_action :setup_resource, only: %i[join]
      before_action :set_chronicle_from_token, only: %i[join]

      def index
        authorize current_player
        @own_chronicles = Chronicle.where(st_id: current_player.id)
        @chronicles = Chronicle.joins(chronicle_players: :player).where(chronicle_players: { player_id: current_player.id })
        render json:    @own_chronicles + @chronicles,
               include: include_hash
      end

      def show
        @chronicle = Chronicle.find(params[:id])

        authorize @chronicle

        return unless stale? @chronicle

        render json: @chronicle, include: include_hash
      end

      def create
        @chronicle = Chronicle.new(resource_params)
        @chronicle.st ||= current_player
        authorize @chronicle

        if @chronicle.save
          render json: @chronicle, include: include_hash
        else
          render json: @chronicle.errors.details, status: :bad_request
        end
      end

      def regen_invite_code
        authorize @chronicle, :update?
        @chronicle.regenerate_invite_code
        if @chronicle.save
          render json: @chronicle, include: []
        else
          render json: @chronicle.errors.details, status: :bad_request
        end
      end

      def join
        authorize current_player, :update?
        @chronicle.players << current_player unless @chronicle.players.include? current_player

        if @chronicle.save
          render json: @chronicle, include: include_hash
        else
          render json: @chronicle.errors.details, status: :bad_request
        end
      end

      def remove_player
        if current_player.id.to_s == params[:player_id]
          authorize current_player, :update?
          @player = current_player
        else
          authorize @chronicle, :update?
          @player = Player.find(params[:player_id])
        end

        @chronicle.remove_player(@player)

        if @chronicle.save
          render json: @chronicle, include: include_hash
        else
          render json: @chronicle.errors.details, status: :bad_request
        end
      end

      def characters
        authorize @chronicle, :show?
        @pagy, @characters = pagy(Character.where(chronicle_id: @chronicle.id))

        return unless stale?(@characters)

        render json: @characters
      end

      def qcs
        authorize @chronicle, :show?
        @pagy, @qcs = pagy(Qc.where(chronicle_id: @chronicle.id))

        return unless stale?(@qcs)

        render json: @qcs
      end

      def battlegroups
        authorize @chronicle, :show?
        @pagy, @battlegroups = pagy(Battlegroup.where(chronicle_id: @chronicle.id))

        return unless stale?(@battlegroups)

        render json: @battlegroups
      end

      def add_character
        @character = Character.find(params[:character_id])
        check_auth @character

        @chronicle.characters << @character
        broadcast_update(@character)
        render json: @chronicle, include: include_hash
      end

      def remove_character
        @character = Character.find(params[:character_id])
        check_auth @character

        @chronicle.characters.delete(@character)
        broadcast_update(@character)
        render json: @chronicle, include: include_hash
      end

      def add_qc
        @qc = Qc.find(params[:qc_id])
        check_auth @qc

        @chronicle.qcs << @qc
        broadcast_update(@qc)
        render json: @chronicle, include: include_hash
      end

      def remove_qc
        @qc = Qc.find(params[:qc_id])
        check_auth @qc

        @chronicle.qcs.delete(@qc)
        broadcast_update(@qc)
        render json: @chronicle, include: include_hash
      end

      def add_battlegroup
        @battlegroup = Battlegroup.find(params[:battlegroup_id])
        check_auth @battlegroup

        @chronicle.battlegroups << @battlegroup
        broadcast_update(@battlegroup)
        render json: @chronicle, include: include_hash
      end

      def remove_battlegroup
        @battlegroup = Battlegroup.find(params[:battlegroup_id])
        check_auth @battlegroup

        @chronicle.battlegroups.delete(@battlegroup)
        broadcast_update(@battlegroup)
        render json: @chronicle, include: include_hash
      end

      private

      def set_chronicle_from_token
        @chronicle = Chronicle.find_by!(invite_code: params[:invite_code])
      end

      def check_auth(char)
        authorize char, :update?
        raise ActiveRecord::NotAuthorized unless # TODO: use a better error
          @chronicle.st == char.player ||
          @chronicle.players.include?(char.player)
      end

      def include_hash
        {
          # characters:   Character.association_types,
          # qcs:          %i[qc_attacks qc_merits qc_attacks qc_charms poisons],
          # battlegroups: %i[qc_attacks poisons],
          players: [],
          st:      []
        }
      end

      def broadcast_update(thing)
        ChronicleCharactersBroadcastJob.perform_later(
          [@chronicle.st_id] + @chronicle.player_ids,
          @chronicle,
          thing.entity_type,
          thing
        )
      end
    end
    # rubocop:enable Metrics/ClassLength
  end
end
