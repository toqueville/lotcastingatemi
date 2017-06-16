# frozen_string_literal: true

# Stores traits for individual weapons.
class Weapon < ApplicationRecord
  belongs_to :character
  delegate :player,    to: :character
  delegate :chronicle, to: :character

  validates :weight, inclusion: { in: %w[ light medium heavy ] }
end
