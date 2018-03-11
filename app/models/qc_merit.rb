# frozen_string_literal: true

# Individual merits for QCs.
class QcMerit < ApplicationRecord
  include Broadcastable
  include QcTrait

  def entity_type
    'qc_merit'
  end

  def entity_assoc
    entity_type
  end
end
