# frozen_string_literal: true

# Represents individual attack pools for QCs.  Battlegroups take these numbers
# and add their own bonuses.
class QcAttack < ApplicationRecord
  include Broadcastable
  include Sortable
  belongs_to :qc_attackable, polymorphic: true
  alias character qc_attackable

  has_many :poisons, as: :poisonable, dependent: :destroy

  delegate :player,      to: :qc_attackable
  delegate :chronicle,   to: :qc_attackable
  delegate :storyteller, to: :qc_attackable
  delegate :hidden,      to: :qc_attackable

  normalizes :tags, with: method(:trim_array_attribute)

  validates :pool, :damage, :overwhelming, numericality: { greater_than: 0 }

  def entity_type
    'qc_attack'
  end
  alias entity_assoc entity_type

  def self.policy_class
    CharacterTraitPolicy
  end
end
